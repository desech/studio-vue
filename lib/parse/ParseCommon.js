const ExtendJS = require('../ExtendJS.js')
const File = require('../File.js')

module.exports = {
  // /path/user/register.html => views/user/UserRegister.vue
  // /path/component/header/nav.html => components/header/HeaderNav.vue
  // component/header/nav.html => components/header/HeaderNav.vue
  getClassPath (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const jsPath = relPath.startsWith('component/')
      ? relPath.replace('component/', 'components/')
      : 'views/' + relPath
    const clsName = this.getClassName(file, folder)
    return File.resolve(File.dirname(jsPath), clsName + '.vue')
  },

  // /path/user/register.html => UserRegister
  // /path/component/header/nav.html => HeaderNav
  // component/header/nav.html => HeaderNav
  getClassName (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const filePath = relPath.replace('component/', '').replace('.html', '')
    return ExtendJS.toPascalCase(filePath)
  },

  // /path/component/header/nav.html => cmp-header-nav
  getCssClass (file, folder = '') {
    const relPath = this.getRelPath(file, folder)
    const filePath = relPath.replace('component/', '').replace('.html', '')
    return 'cmp-' + filePath.replaceAll('/', '-')
  },

  getRelPath (file, folder) {
    return folder ? file.replace(folder + '/', '') : file
  },

  getComponentData (node) {
    const data = node.getAttributeNS(null, 'data-ss-component')
    const json = data ? JSON.parse(data) : null
    return json
  },

  getProperties (node) {
    const string = node.getAttributeNS(null, 'data-ss-properties')
    return string ? JSON.parse(string) : {}
  },

  setProperties (node, properties) {
    if (ExtendJS.isEmpty(properties)) {
      node.removeAttributeNS(null, 'data-ss-properties')
    } else {
      node.setAttributeNS(null, 'data-ss-properties', JSON.stringify(properties))
    }
  }
}
