const fs = require('fs')
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
    const routes = this.getFiles(folder, htmlFiles, 'page', 'getClassRoute').join('')
    return this.injectJs(js, routes, 'route', 2)
  },

  injectJs (js, snippet, location, spaces = 0) {
    const regex = new RegExp(`(\\/\\/ desech studio - start ${location} block\r?\n)` +
      `([\\s\\S]*?)([ ]{${spaces}}\\/\\/ desech studio - end ${location} block)`, 'g')
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

  getClassRoute (folder, file) {
    const dir = ParseCommon.getClassDir(file.path, folder)
    let route = dir + '/' + ParseCommon.getClassFile(file.name)
    if (route === '/index') return
    if (route.endsWith('/index')) route = route.replace('/index', '/')
    const cls = ParseCommon.getClassName(file.name)
    return `  ,{
    path: '${route}',
    name: '${cls}',
    component: () => import(/* webpackChunkName: "about" */ '../page${dir}/${cls}.vue')\n  }\n`
  },

  getClassJsFile (folder, filePath, type) {
    filePath = (type === 'component') ? filePath.replace('/component', '') : filePath
    const dir = ParseCommon.getClassDir(filePath, folder)
    const cls = ParseCommon.getClassName(File.basename(filePath))
    return folder + `/_export/src/${type}${dir}/${cls}.vue`
  },

  parseClassJsCode (js, file, JSDOM) {
    const body = this.getClassBody(file.path)
    js = this.injectJs(js, this.getCodeComponents(body, 'getCodeImport'), 'import')
    js = this.injectJs(js, this.getCodeComponents(body, 'getCodeClass'), 'component', 4)
    js = this.getCodeTemplate(js, body, JSDOM)
    return js
  },

  getClassBody (filePath) {
    const body = fs.readFileSync(filePath).toString()
    // components don't have <body>
    if (body.indexOf('<body>') === -1) return body
    const match = /<body>([\s\S]*)<\/body>/g.exec(body)
    return (match && match[1]) ? match[1].trim() : ''
  },

  getCodeComponents (html, callback) {
    const list = []
    const matches = html.matchAll(/<div class="component" src="component(.*?).html".*?>/g)
    for (const match of matches) {
      const line = this[callback](match[1])
      list.push(line)
    }
    return ExtendJS.unique(list).join('')
  },

  getCodeImport (htmlFile) {
    const component = ParseCommon.getClassName(htmlFile)
    const file = `/component${ParseCommon.getClassDir(htmlFile)}/${component}.vue`
    return `import ${component} from '@${file}'\n`
  },

  getCodeClass (htmlFile) {
    const component = ParseCommon.getClassName(htmlFile)
    return `    ${component},\n`
  },

  getCodeTemplate (js, body, JSDOM) {
    const html = ParseRender.getTemplateBlock(body, JSDOM)
    return js.replace(/(<template>)([\s\S]*?)(<\/template>)/g, `$1\n  ${html}\n$3`)
  }
}
