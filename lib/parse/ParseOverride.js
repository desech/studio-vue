const Html = require('../Html.js')
const ExtendJS = require('../ExtendJS.js')
const ParseCommon = require('./ParseCommon.js')

module.exports = {
  // data = { regex: {}, defaults: {} }
  injectOverrides (node, ref, overrides, data, document) {
    this.injectInner(node, ref, overrides, data)
    this.injectAttributes(node, ref, overrides, data)
    this.injectProperties(node, ref, overrides, data)
    this.injectUnrender(node, ref, overrides, data)
    this.injectTag(node, ref, overrides, data, document)
    this.injectComponent(node, ref, overrides, data, document)
  },

  injectInner (node, ref, overrides, data) {
    if (!overrides || !('inner' in overrides)) return
    if (!data.defaults[ref]) data.defaults[ref] = {}
    data.defaults[ref].inner = Html.escapeQuotedHtml(node.innerHTML)
    node.innerHTML = ''
    node.setAttributeNS(null, 'v-html', `d.${ref}Inner`)
  },

  injectAttributes (node, ref, overrides, data) {
    if (!overrides?.attributes) return
    for (const name of Object.keys(overrides.attributes)) {
      this.injectAttribute(node, ref, name, data)
    }
  },

  injectAttribute (node, ref, name, data) {
    this.setAttributeRegex(node, ref, name, data.regex)
    const filteredName = name.replace(/[^a-zA-Z0-9-_]/g, '')
    node.setAttributeNS(null, `desech-regex-override-attr-${ref}-${filteredName}`, name)
    if (node.hasAttributeNS(null, name)) {
      const value = node.getAttributeNS(null, name)
      this.setAttributeDefault(ref, name, value, data.defaults)
      node.removeAttributeNS(null, name)
    }
  },

  setAttributeRegex (node, ref, name, regex) {
    if (!regex[ref]) regex[ref] = {}
    if (!regex[ref].attributes) regex[ref].attributes = {}
    const index = this.getIndex(ref, 'Attr', name)
    regex[ref].attributes[name] = `:${name}="d.${index}"`
  },

  getIndex (ref, type, name) {
    const label = ExtendJS.toPascalCase(name)
    return ref + type + label
  },

  setAttributeDefault (ref, name, value, defaults) {
    if (!defaults[ref]) defaults[ref] = {}
    if (!defaults[ref].attributes) defaults[ref].attributes = {}
    defaults[ref].attributes[name] = { value: Html.escapeQuotedHtml(value) }
  },

  injectProperties (node, ref, overrides, data) {
    if (!overrides?.properties) return
    const existingProps = ParseCommon.getProperties(node)
    for (const name of Object.keys(overrides.properties)) {
      this.injectProperty(node, ref, name, data, existingProps)
    }
    ParseCommon.setProperties(node, existingProps)
  },

  // we use the same regex from attributes to set the final property values
  injectProperty (node, ref, name, data, existingProps) {
    this.setPropertyRegex(node, ref, name, data.regex)
    const filteredName = name.replace(/[^a-zA-Z0-9-_]/g, '')
    node.setAttributeNS(null, `desech-regex-override-attr-${ref}-${filteredName}`, name)
    if (name in existingProps) {
      this.setPropertyDefault(ref, name, existingProps[name], data.defaults)
      delete existingProps[name]
    }
  },

  setPropertyRegex (node, ref, name, regex) {
    if (!regex[ref]) regex[ref] = {}
    if (!regex[ref].attributes) regex[ref].attributes = {}
    const index = this.getIndex(ref, 'Attr', name)
    // directive don't need `:`, but other properties do
    const pre = this.isDirective(name) ? '' : ':'
    regex[ref].attributes[name] = `${pre}${name}="d.${index}"`
  },

  isDirective (name) {
    // https://v3.vuejs.org/api/directives.html
    return /^((v-)|@|:|\.|#)/.test(name)
  },

  setPropertyDefault (ref, name, value, defaults) {
    if (!defaults[ref]) defaults[ref] = {}
    if (!defaults[ref].properties) defaults[ref].properties = {}
    defaults[ref].properties[name] = { value: Html.escapeQuotedHtml(value) }
  },

  // overrides built by ExportData.getAllComponentData() don't have `data-ss-unrender`
  // instead they have the `unrender` property
  // this deals with overrides, but also with default unrender attributes
  injectUnrender (node, ref, overrides, data) {
    const exists = this.setUnrenderDefaults(node, ref, data.defaults)
    this.setUnrenderOverride(node, ref, overrides, exists, data)
  },

  setUnrenderDefaults (node, ref, defaults) {
    if (!node.hasAttributeNS(null, 'data-ss-unrender')) return false
    node.removeAttributeNS(null, 'data-ss-unrender')
    if (!defaults[ref]) defaults[ref] = {}
    if (!defaults[ref].attributes) defaults[ref].attributes = {}
    defaults[ref].attributes['data-ss-unrender'] = { value: '' }
    return true
  },

  // the default unrender can't exist without the override logic
  setUnrenderOverride (node, ref, overrides, exists, data) {
    if (exists || overrides?.unrender) {
      node.setAttributeNS(null, 'v-if', `!d.${ref}Unrender`)
    }
  },

  injectTag (node, ref, overrides, data, document) {
    if (!overrides?.tag) return node
    if (!data.defaults[ref]) data.defaults[ref] = {}
    data.defaults[ref].tag = this.getTag(node)
    node.setAttributeNS(null, 'desech-regex-override-is', `d.${ref}Tag`)
    return Html.changeTag(node, 'component', document)
  },

  // we still have the template tags changed to template-desech, so revert it here
  getTag (node) {
    const tag = Html.getTag(node)
    return tag.replace('template-desech', 'template')
  },

  // swapping components with other components
  injectComponent (node, ref, overrides, data, document) {
    if (!overrides?.component) return node
    if (!data.defaults[ref]) data.defaults[ref] = {}
    data.defaults[ref].component = node.tagName
    node.setAttributeNS(null, 'desech-regex-override-is', `d.${ref}Component`)
    return Html.changeTag(node, 'component', document)
  },

  replaceOverrides (html, data) {
    html = this.replaceAttributes(html, data)
    html = html.replace(/desech-regex-override-is="(.*?)"/g, ':is="$1"')
    return html
  },

  replaceAttributes (html, data) {
    const regex = /desech-regex-override-attr-(e0[a-z0-9]+)-.*?="(.*?)"/g
    return html.replace(regex, (match, ref, name) => {
      return data.regex[ref].attributes[name]
    })
  },

  overrideClasses (ref, classes, overrides, defaults) {
    if (!overrides?.classes) return false
    for (const [name, action] of Object.entries(overrides.classes)) {
      this.setClassDefault(ref, name, action, defaults)
      const code = this.getOverrideClassCode(ref, name)
      classes.push(code)
      ExtendJS.removeFromArray(classes, name)
    }
    return true
  },

  setClassDefault (ref, name, action, defaults) {
    if (action === 'create') return
    if (!defaults[ref]) defaults[ref] = {}
    if (!defaults[ref].classes) defaults[ref].classes = {}
    defaults[ref].classes[name] = { add: true }
  },

  getOverrideClassCode (ref, name) {
    const index = this.getIndex(ref, 'Cls', name)
    return `d.${index}`
  }
}
