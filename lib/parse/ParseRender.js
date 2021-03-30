const ParseCommon = require('./ParseCommon.js')

module.exports = {
  getHtmlBlock (dom) {
    this.injectClassComponents(dom.window.document, dom.window.document)
    const html = dom.window.document.body.innerHTML
    return this.regexHtml(html)
  },

  injectClassComponents (document, container) {
    for (const div of container.querySelectorAll('div.component')) {
      const tag = this.getComponentTag(document, div)
      div.replaceWith(tag)
      this.injectClassComponents(document, tag)
    }
  },

  getComponentTag (document, div) {
    const cls = ParseCommon.getClassFile(div.getAttributeNS(null, 'src'))
    const tag = document.createElementNS('https://www.w3.org/XML/1998/namespace', cls)
    if (div.hasAttributeNS(null, 'data-element-properties')) {
      const props = div.getAttributeNS(null, 'data-element-properties')
      tag.setAttributeNS(null, 'data-element-properties', props)
    }
    tag.innerHTML = div.innerHTML
    return tag
  },

  regexHtml (html) {
    html = html.replace(/<div class="component-children(.*?)><\/div>/g,
      '<ng-content></ng-content>')
    html = html.replace(/ href="/g, ' routerLink="')
    html = this.replaceShortAttributes(html)
    html = this.addElementProperties(html)
    return html
  },

  replaceShortAttributes (html) {
    html = html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g,
      ' $1')
    return html
  },

  addElementProperties (html) {
    return html.replace(/data-element-properties="(.*?)"/g, (match, json) => {
      const props = JSON.parse(json.replaceAll('&quot;', '"'))
      const attrs = []
      for (const [name, value] of Object.entries(props)) {
        attrs.push(`${name}="${value.replaceAll('"', '&quot;')}"`)
      }
      return attrs.join(' ')
    })
  }
}
