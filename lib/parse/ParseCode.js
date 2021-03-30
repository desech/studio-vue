const fs = require('fs')
const ExtendJS = require('../ExtendJS.js')
const ParseCommon = require('./ParseCommon.js')
const ParseRender = require('./ParseRender.js')

module.exports = {
  getIndexHtml (html) {
    html = html.replace(/<base href="">[\s\S]*?<\/script>/g, '<base href="/">')
    html = html.replace(/<link[\s\S]*.css">/g,
      '<link rel="stylesheet" href="/styles.css">')
    html = html.replace(/<body>[\s\S]*<\/body>/g, '<body>\n  <app-root></app-root>\n</body>')
    return html
  },

  getJsAppModule (js, folder, htmlFiles) {
    const imports = this.getFiles(folder, htmlFiles, null, 'getClassImport').join('')
    js = this.injectJs(js, imports, 'import')
    const modules = this.getFiles(folder, htmlFiles, null, 'getAppModuleClass').join('')
    js = this.injectJs(js, modules, 'module', 4)
    return js
  },

  injectJs (js, snippet, location, spaces = 0) {
    const regex = new RegExp(`(\\/\\/ desech studio - start ${location} block\n)([\\s\\S]*?)` +
      `([ ]{${spaces}}\\/\\/ desech studio - end ${location} block)`, 'g')
    return js.replace(regex, `$1${snippet}$3`)
  },

  getFiles (folder, files, type, callback) {
    const list = []
    for (const file of files) {
      if (!type || (type === 'page' && !file.isComponent) ||
        (type === 'component' && file.isComponent)) {
        list.push(this[callback](folder, file))
      }
    }
    return ExtendJS.unique(list)
  },

  getClassImport (folder, file) {
    const cls = ParseCommon.getClassName(file.name)
    const dir = ParseCommon.getModuleDir(folder, file)
    const name = ParseCommon.getClassFile(file.name)
    return `import { ${cls}Component } from './${dir}/${name}.component';\n`
  },

  getAppModuleClass (folder, file) {
    const cls = ParseCommon.getClassName(file.name)
    return `    ${cls}Component,\n`
  },

  getJsAppRouter (js, folder, htmlFiles) {
    const imports = this.getFiles(folder, htmlFiles, 'page', 'getClassImport').join('')
    js = this.injectJs(js, imports, 'import')
    const routes = this.getFiles(folder, htmlFiles, 'page', 'getRoutePath').join('')
    js = this.injectJs(js, routes, 'route', 2)
    return js
  },

  getRoutePath (folder, file) {
    let route = (ParseCommon.getClassDir(file.path, folder) + '/' +
      ParseCommon.getClassFile(file.name)).substring(1)
    if (route.endsWith('index')) route = route.replace('index', '')
    const cls = ParseCommon.getClassName(file.name)
    return `  { path: '${route}', component: ${cls}Component },\n`
  },

  parseModuleHtml (file, JSDOM) {
    const body = this.getClassBody(file.path)
    const dom = new JSDOM(body)
    return ParseRender.getHtmlBlock(dom)
  },

  getClassBody (filePath) {
    const body = fs.readFileSync(filePath).toString()
    // components don't have <body>
    if (body.indexOf('<body>') === -1) return body
    const match = /<body>([\s\S]*)<\/body>/g.exec(body)
    return (match && match[1]) ? match[1].trim() : ''
  }
}
