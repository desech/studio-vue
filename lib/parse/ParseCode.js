const ExtendJS = require('../ExtendJS.js')
const File = require('../File.js')
const ParseCommon = require('./ParseCommon.js')
const ParseRender = require('./ParseRender.js')

module.exports = {
  getIndexHtml (html) {
    html = html.replace(/<base href="">[\s\S]*?<\/script>/g, '<base href="/">')
    html = html.replace(/<link[\s\S]*.css">/g,
      '<link rel="stylesheet" href="css/compiled/style.css">')
    html = html.replace(/<body[\s\S]*<\/body>/g, '<body>\n  <div id="app"></div>\n</body>')
    return html
  },

  getJsRouter (js, folder, htmlFiles) {
    const routes = this.getClassImports(htmlFiles, folder).join(',\n')
    return this.injectJs(js, routes + '\n', 'route', 2)
  },

  getClassImports (files, folder) {
    const list = []
    for (const file of files) {
      if (!file.isComponent) {
        list.push(this.getClassRoute(file, folder))
      }
    }
    return ExtendJS.unique(list)
  },

  getClassRoute (file, folder) {
    let route = file.path.replace(folder, '')
    if (route.includes('/index')) route = File.dirname(route)
    const cls = ParseCommon.getClassName(file.path, folder)
    const clsPath = ParseCommon.getClassPath(file.path, folder)
    return `  {
    path: '${route}',
    name: '${cls}',
    component: () => import(/* webpackChunkName: "desech" */ '../${clsPath}')\n  }`
  },

  injectJs (string, snippet, location, spaces = 0) {
    const regex = new RegExp(`(\\/\\/ desech - start ${location} block\r?\n)` +
      `([\\s\\S]*?)([ ]{${spaces}}\\/\\/ desech - end ${location} block)`, 'g')
    return string.replace(regex, `$1${snippet}$3`)
  },

  injectHtml (string, snippet, location, spaces = 0) {
    const regex = new RegExp(`(<!-- desech - start ${location} block -->\r?\n)` +
      `([\\s\\S]*?)([ ]{${spaces}}<!-- desech - end ${location} block -->)`, 'g')
    return string.replace(regex, `$1${snippet}$3`)
  },

  getClassJsFile (folder, filePath) {
    const clsPath = ParseCommon.getClassPath(filePath, folder)
    return File.resolve(folder, `_export/src/${clsPath}`)
  },

  parseClassJsCode (js, file, relBase, data, lib) {
    const body = this.getClassBody(file.path)
    if (!body) return
    const render = ParseRender.getRenderBlock(body, file, data, lib)
    js = this.injectHtml(js, render.html, 'template')
    const componentData = this.getComponentData(body, render.component)
    js = this.injectJs(js, componentData, 'data', 4)
    const imports = this.getImports(file.path, data.folder, data.component.imports)
    js = this.injectJs(js, this.getImportCode(relBase, imports), 'import')
    js = this.injectJs(js, this.getInstanceCode(imports), 'instance', 4)
    js = this.injectJs(js, this.getPropsCode(render.component), 'props', 4)
    return js
  },

  getClassBody (filePath) {
    const body = File.readFile(filePath)
    if (!body) return
    // components don't have <body>
    if (body.indexOf('<body>') === -1) return body
    const match = /<body>([\s\S]*)<\/body>/g.exec(body)
    return (match && match[1]) ? match[1].trim() : ''
  },

  getComponentData (body, data) {
    this.replaceComponentInstances(data)
    const desech = JSON.stringify(data, null, 2).replace(/(\r\n|\n|\r)/gm, '\n    ')
    return '    const desech = ' + desech + '\n'
  },

  // we have component classes set by ParentOverride.injectComponent() in the `defaults` object
  // and we also have component files coming from Desech Studio in `overrides` and `variants`
  // we have to convert all this to vue classes
  replaceComponentInstances (data) {
    if (ExtendJS.isEmpty(data)) return
    for (const [name, value] of Object.entries(data)) {
      if (name === 'component') {
        this.addInstance(data, value)
      } else if (typeof value === 'object') {
        this.replaceComponentInstances(value)
      }
    }
  },

  // overrides have "component/file.html", while defaults have "ComponentFoo"
  addInstance (data, value) {
    if (value.startsWith('component/')) {
      data.component = ParseCommon.getClassName(value)
    }
  },

  getImports (filePath, folder, imports) {
    const relFile = ParseCommon.getRelPath(filePath, folder)
    return ExtendJS.unique([
      ...imports.default[relFile] || [],
      ...imports.parentOverrides[relFile] || []
    ])
  },

  getImportCode (relBase, imports) {
    const list = []
    list.push(`import DS from '${File.relative(relBase, '/lib/DS.js')}'`)
    this.addComponentImports(list, imports, relBase)
    return list.join('\n') + '\n'
  },

  addComponentImports (list, imports, relBase) {
    if (!imports.length) return
    for (const file of imports) {
      const line = this.getClassComponentImport(file, relBase)
      list.push(line)
    }
  },

  getClassComponentImport (cmpFile, relBase) {
    const clsPath = ParseCommon.getClassPath(cmpFile)
    const clsPathRel = File.relative(relBase, '/' + clsPath)
    const dottedPath = clsPathRel.startsWith('.') ? clsPathRel : './' + clsPathRel
    const clsName = ParseCommon.getClassName(cmpFile)
    return `import ${clsName} from '${dottedPath}'`
  },

  getInstanceCode (imports) {
    if (!imports.length) return ''
    const list = []
    for (const file of imports) {
      const instance = ParseCommon.getClassName(file)
      list.push(`    ${instance}`)
    }
    return list.length ? list.join(',\n') + '\n' : ''
  },

  getPropsCode (data) {
    let js = this.getPropTypesVariants(data?.variants)
    js += "    'd-ref': String,\n"
    js += "    'd-overrides': Object\n"
    return js
  },

  getPropTypesVariants (variants) {
    let js = ''
    if (variants) {
      for (const name of Object.keys(variants)) {
        js += `    'd-var-${name}': String,\n`
      }
    }
    return js
  }
}
