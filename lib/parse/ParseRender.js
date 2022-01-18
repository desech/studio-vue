const Html = require('../Html.js')
const ExtendJS = require('../ExtendJS.js')
const ParseCommon = require('./ParseCommon.js')
const ParseRegex = require('./ParseRegex.js')

module.exports = {
  _component: {},

  getRenderBlock (body, file, data, lib) {
    this.reset()
    const document = (new lib.jsdom.JSDOM(body)).window.document
    this.processNodes(file, data, document)
    return {
      // this one first because it removes the component attribute after extraction
      component: this.processComponentData(file, document),
      html: ParseRegex.regexHtmlRender(file, data, document, lib)
    }
  },

  reset () {
    this._component = { regex: {}, defaults: {} }
  },

  processNodes (file, data, document) {
    this.injectClassComponents(document, data.folder)
    this.injectComponentHole(document)
    this.cleanClasses(document)
  },

  injectClassComponents (document, folder) {
    // you can't just for loop through it because we replace nodes
    let div
    while (div = document.querySelector('div.component')) { // eslint-disable-line
      const component = this.getComponentNode(document, div, folder)
      div.replaceWith(component)
    }
  },

  getComponentNode (document, node, folder) {
    const data = ParseCommon.getComponentData(node)
    const cmpInstance = ParseCommon.getClassName(data.file, folder)
    const clone = document.createElementNS('https://www.w3.org/XML/1998/namespace', cmpInstance)
    // this.setComponentProperties(clone, data)
    // this.setComponentData(clone, data)
    Html.transferChildren(node, clone)
    return clone
  },

  injectComponentHole (document) {
    for (const node of document.querySelectorAll('[data-ss-component-hole]')) {
      node.removeAttributeNS(null, 'data-ss-component-hole')
      node.innerHTML = '<slot></slot>'
    }
  },

  cleanClasses (document) {
    // getElementsByClassName doesn't work correctly with jsdom
    for (const node of document.querySelectorAll('[class*="e0"]')) {
      if (node.classList.contains('text')) {
        node.classList.remove('text')
      }
    }
  },

  // data: defaults, variants, variantMap
  processComponentData (file, document) {
    const data = {}
    if (file.isComponent) {
      const root = document.body.children[0]
      const mainData = ParseCommon.getComponentData(root)
      if (mainData) this.processMainComponentData(root, mainData, data)
    }
    if (!ExtendJS.isEmpty(this._component.defaults)) {
      data.defaults = this._component.defaults
    }
    return data
  },

  processMainComponentData (root, mainData, data) {
    root.removeAttributeNS(null, 'data-ss-component')
    data.variants = mainData.variants
    data.variantMap = this.getVariantMap(mainData.variants)
  },

  getVariantMap (variants) {
    const map = {}
    for (const name of Object.keys(variants)) {
      map[name] = ExtendJS.toPascalCase(name)
    }
    return map
  }
}
