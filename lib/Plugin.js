const fs = require('fs')
const path = require('path')
const File = require('./File.js')
const Template = require('./Template.js')
const ParseCommon = require('./parse/ParseCommon.js')
const ParseCode = require('./parse/ParseCode.js')

module.exports = {
  async syncAppFiles (folder) {
    const source = path.resolve(__dirname, '../dist/my-app')
    const dest = path.resolve(folder, '_export')
    File.createMissingDir(dest)
    const fileTree = File.readFolder(source)
    // we don't want to overwrite the boilerplate files
    await File.syncFolder(fileTree, source, dest, false)
  },

  async syncStaticFolders (data) {
    const dir = path.resolve(data.folder, '_export/public')
    const file = path.resolve(dir, 'css/compiled/style.css')
    File.writeToFile(file, data.compiledCss)
    // we do want to overwrite all the static files
    await File.syncFolder(data.rootMiscFiles, data.folder, dir)
  },

  syncIndexHtml (folder) {
    const html = Template.getProjectFile(folder, 'index.html')
    const file = path.resolve(folder, '_export/public/index.html')
    File.writeToFile(file, ParseCode.getIndexHtml(html))
  },

  syncJsCode (folder, htmlFiles, JSDOM) {
    this.syncJsRouter(folder, htmlFiles)
    this.syncJsComponents(folder, htmlFiles, JSDOM)
    this.syncJsPages(folder, htmlFiles, JSDOM)
  },

  syncJsRouter (folder, htmlFiles, module) {
    const jsFile = 'router/index.js'
    const file = path.resolve(folder, '_export/src', jsFile)
    const js = fs.existsSync(file) ? File.readFile(file) : Template.getTemplate(jsFile)
    File.writeToFile(file, ParseCode.getJsRouter(js, folder, htmlFiles))
  },

  syncJsComponents (folder, htmlFiles, JSDOM) {
    for (const file of htmlFiles) {
      if (file.isComponent) this.syncJsModule(folder, file, 'component', JSDOM)
    }
  },

  syncJsPages (folder, htmlFiles, JSDOM) {
    for (const file of htmlFiles) {
      if (!file.isComponent) this.syncJsModule(folder, file, 'page', JSDOM)
    }
  },

  syncJsModule (folder, file, type, JSDOM) {
    const destFile = ParseCode.getClassJsFile(folder, file.path, type)
    let js = this.getClassJSCode(destFile, file.name)
    js = ParseCode.parseClassJsCode(js, file, JSDOM)
    File.writeToFile(destFile, js)
  },

  getClassJSCode (file, name) {
    if (fs.existsSync(file)) return File.readFile(file)
    const js = Template.getTemplate('Component.vue')
    return js.replace('CLASSNAME', ParseCommon.getClassName(name))
  }
}
