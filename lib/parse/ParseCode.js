const ExtendJS = require('../ExtendJS.js')
const File = require('../File.js')
const ParseCommon = require('./ParseCommon.js')
const ParseRender = require('./ParseRender.js')

module.exports = {
  getIndexHtml (html) {
    html = html.replace(/<base href="">[\s\S]*?<\/script>/g, '<base href="/">')
    html = html.replace(/<link[\s\S]*.css">/g,
      '<link rel="stylesheet" href="css/compiled/style.css">')
    html = html.replace(/<body>[\s\S]*<\/body>/g, '<body>\n  <div id="app"></div>\n</body>')
    return html
  },

  getJsRouter (js, folder, htmlFiles) {
    const routes = this.getFiles(folder, htmlFiles, 'page', 'getClassRoute')
    return this.injectJs(js, routes.join(',\n') + '\n', 'route', 2)
  },

  injectJs (js, snippet, location, spaces = 0) {
    const regex = new RegExp(`(\\/\\/ desech - start ${location} block\r?\n)` +
      `([\\s\\S]*?)([ ]{${spaces}}\\/\\/ desech - end ${location} block)`, 'g')
    return js.replace(regex, `$1${snippet}$3`)
  },

  getFiles (folder, files, fileType, callback) {
    const list = []
    for (const file of files) {
      if (!fileType || (fileType === 'page' && !file.isComponent) ||
        (fileType === 'component' && file.isComponent)) {
        list.push(this[callback](folder, file))
      }
    }
    return ExtendJS.unique(list)
  },

  getClassRoute (folder, file) {
    let route = file.path.replace(folder, '')
    if (route.includes('/index')) route = File.dirname(route)
    const cls = ParseCommon.getClassName(file.path, folder)
    const clsPath = ParseCommon.getClassPath(file.path, folder)
    return `  {
    path: '${route}',
    name: '${cls}',
    component: () => import(/* webpackChunkName: "desech" */ '../${clsPath}')\n  }`
  },

  getClassJsFile (folder, filePath) {
    const clsPath = ParseCommon.getClassPath(filePath, folder)
    return File.resolve(folder, `_export/src/${clsPath}`)
  },

  parseClassJsCode (js, file, data, lib) {
    const body = this.getClassBody(file.path)
    const render = ParseRender.getRenderBlock(body, file, data, lib)
    const components = this.getCodeComponents(body)
    js = this.injectJs(js, render.html, 'template')
    js = this.injectJs(js, this.getCodeLines(components, 'getCodeImport'), 'import')
    js = this.injectJs(js, this.getCodeLines(components, 'getCodeInstance', ',\n'), 'instance', 4)
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

  getCodeComponents (body) {
    const list = []
    this.addBodyComponents(list, body)
    return ExtendJS.unique(list)
  },

  addBodyComponents (list, body) {
    const matches = body.matchAll(/data-ss-component="(.*?)"/g)
    for (const match of matches) {
      const json = JSON.parse(match[1].replaceAll('&quot;', '"'))
      // we skip the master component data; we only want the instances
      if (json.file) list.push(json.file)
    }
  },

  getCodeLines (components, callback, glue = '\n') {
    const list = []
    for (const relFile of components) {
      const instance = ParseCommon.getClassName(relFile)
      const file = ParseCommon.getClassPath(relFile)
      list.push(this[callback](instance, file))
    }
    return list.length ? list.join(glue) + '\n' : ''
  },

  getCodeImport (instance, file) {
    return `import ${instance} from '@/${file}'`
  },

  getCodeInstance (instance, file) {
    return `    ${instance}`
  }
}
