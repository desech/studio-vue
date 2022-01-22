const Html = require('../Html.js')
const ExtendJS = require('../ExtendJS.js')
const ParseRegex = require('./ParseRegex.js')
const ParseCommon = require('./ParseCommon.js')
const ParseOverride = require('./ParseOverride.js')

module.exports = {
  _component: {},

  getRenderBlock (body, file, data, lib) {
    this.reset()
    const document = (new lib.jsdom.JSDOM(body)).window.document
    this.processNodes(file, data, document)
    const component = this.processMainComponentData(file, document)
    const html = ParseRegex.regexHtmlRender(file, data, this._component, document, lib)
    if (!ExtendJS.isEmpty(this._component.defaults)) {
      component.defaults = this._component.defaults
    }
    return { component, html }
  },

  reset () {
    this._component = { regex: {}, defaults: {} }
  },

  processNodes (file, data, document) {
    this.replaceTemplates(document)
    this.injectComponentRootData(document.body.children[0], file, data.folder)
    this.injectComponentInstances(document, file, data.folder)
    this.injectComponentHole(document)
    this.injectComponentOverrides(document, data.component.overrides)
    this.revertTemplates(document)
  },

  // because <template>s are traversed differently, we need to temporarily change them to another
  // tag <template-desech>, and then we will revert them back
  replaceTemplates (document) {
    Html.changeAllNodes('template', document, node => {
      Html.changeTag(node, 'template-desech', document)
    })
  },

  revertTemplates (document) {
    Html.changeAllNodes('template-desech', document, node => {
      Html.changeTag(node, 'template', document)
    })
  },

  injectComponentRootData (root, file, folder) {
    if (!file.isComponent) return
    const compClass = ParseCommon.getCssClass(file.path, folder)
    root.classList.add(compClass)
    root.classList.add('desech-regex-root-class')
    // we want data-variant="" all the time because of how css works
    root.setAttributeNS(null, 'desech-regex-root-variants', '')
  },

  injectComponentInstances (document, file, folder) {
    Html.changeAllNodes('div.component', document, node => {
      const component = this.getComponentNode(document, node, folder)
      node.replaceWith(component)
    })
  },

  getComponentNode (document, node, folder) {
    const data = ParseCommon.getComponentData(node)
    const cmpInstance = ParseCommon.getClassName(data.file, folder)
    const clone = document.createElementNS('https://www.w3.org/XML/1998/namespace', cmpInstance)
    this.setComponentProperties(clone, data)
    this.setComponentData(clone, data)
    Html.transferChildren(node, clone, document)
    return clone
  },

  setComponentProperties (node, data) {
    // we set the properties as an attribute, and process them in the the same way as elements
    if (data.properties) {
      node.setAttributeNS(null, 'data-ss-properties', JSON.stringify(data.properties))
    }
  },

  setComponentData (node, data) {
    node.setAttributeNS(null, 'desech-regex-component-ref', data.ref)
    this.setComponentDataOverrides(node, data)
    this.setComponentDataVariants(node, data)
  },

  // we need overrides and variants all the time because the way props are passed around
  setComponentDataOverrides (node, data) {
    node.setAttributeNS(null, 'desech-regex-component-overrides-' + data.ref, '')
    if (data.overrides) {
      if (!this._component.defaults[data.ref]) this._component.defaults[data.ref] = {}
      this._component.defaults[data.ref].overrides = data.overrides
    }
  },

  setComponentDataVariants (node, data) {
    node.setAttributeNS(null, 'desech-regex-component-variants-' + data.ref, data.file)
    if (data.variants) {
      if (!this._component.defaults[data.ref]) this._component.defaults[data.ref] = {}
      this._component.defaults[data.ref].variants = data.variants
    }
  },

  injectComponentHole (document) {
    for (const node of document.querySelectorAll('[data-ss-component-hole]')) {
      node.removeAttributeNS(null, 'data-ss-component-hole')
      node.innerHTML = '<slot></slot>'
    }
  },

  injectComponentOverrides (document, overrides) {
    const nodes = document.querySelectorAll('[class*="e0"], [desech-regex-component-ref]')
    for (const node of nodes) {
      const ref = Html.getAnyRef(node)
      ParseOverride.injectOverrides(node, ref, overrides[ref], this._component)
    }
  },

  processMainComponentData (file, document) {
    if (!file.isComponent) return {}
    const root = document.body.children[0]
    const mainData = ParseCommon.getComponentData(root)
    if (!mainData) return {}
    root.removeAttributeNS(null, 'data-ss-component')
    return {
      variants: mainData.variants,
      variantMap: this.getVariantMap(mainData.variants)
    }
  },

  getVariantMap (variants) {
    const map = {}
    for (const name of Object.keys(variants)) {
      map[name] = ExtendJS.toPascalCase(name)
    }
    return map
  }
}
