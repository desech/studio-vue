const ParseCommon = require('./ParseCommon.js')

module.exports = {
  getTemplateBlock (body, css, JSDOM) {
    const initialHtml = this.replaceTemplate(body)
    const document = (new JSDOM(initialHtml)).window.document
    this.injectClassComponents(document, document)
    this.cleanClasses(document, css)
    const html = this.replaceTemplateBack(document.body.innerHTML)
    return this.regexHtmlRender(html)
  },

  cleanClasses (document, css) {
    // getElementsByClassName doesn't work correctly with jsdom
    for (const node of document.querySelectorAll('[class*="e0"]')) {
      if (node.classList.contains('text')) node.classList.remove('text')
      const ref = this.getRefFromClasses(node)
      if (!css.includes('.' + ref)) node.classList.remove(ref)
      if (!node.getAttributeNS(null, 'class')) {
        node.removeAttributeNS(null, 'class')
      }
    }
  },

  getRefFromClasses (node) {
    for (const cls of node.classList) {
      if (cls.startsWith('e0')) return cls
    }
  },

  // template tags will not work since the main component is a template itself
  replaceTemplate (html) {
    return html.replaceAll('<template', '<templatex123abc')
      .replaceAll('</template>', '</templatex123abc>')
  },

  replaceTemplateBack (html) {
    return html.replaceAll('<templatex123abc', '<template')
      .replaceAll('</templatex123abc>', '</template>')
  },

  injectClassComponents (document, container) {
    for (const div of container.querySelectorAll('div.component')) {
      const tag = this.getComponentTag(document, div)
      div.replaceWith(tag)
      this.injectClassComponents(document, tag)
    }
  },

  getComponentTag (document, div) {
    const cls = ParseCommon.getClassName(div.getAttributeNS(null, 'src'))
    const tag = document.createElementNS('https://www.w3.org/XML/1998/namespace', cls)
    if (div.hasAttributeNS(null, 'data-element-properties')) {
      const props = div.getAttributeNS(null, 'data-element-properties')
      tag.setAttributeNS(null, 'data-element-properties', props)
    }
    tag.innerHTML = div.innerHTML
    return tag
  },

  regexHtmlRender (html) {
    html = html.replace(/<div class="component-children(.*?)><\/div>/g, '<slot></slot>')
    html = html.replace(/<a(.*?)href="([^http].*?)"(.*?)>([\s\S]*?)<\/a>/,
      '<router-link$1to="$2"$3>$4</router-link>')
    html = this.replaceShortAttributes(html)
    html = this.addElementProperties(html)
    return html.replace(/\r?\n/g, '\n  ')
  },

  replaceShortAttributes (html) {
    return html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g,
      ' $1')
  },

  addElementProperties (html) {
    // we can't add attributes with setAttributeNS because we allow invalid html/xml attributes
    return html.replace(/(class="([^><]*?)"([^><]*?))?data-element-properties="(.*?)"/g,
      (match, extraBlock, cls, extra, json) => {
        const props = JSON.parse(json.replaceAll('&quot;', '"'))
        const attrs = this.getPropertyAttributes(props, cls || '')
        return extraBlock ? (attrs + ' ' + extra).trim() : attrs
      }
    )
  },

  getPropertyAttributes (props, cls) {
    const attrs = []
    if (!props.class && cls) attrs.push(`class="${cls}"`)
    for (let [name, value] of Object.entries(props)) {
      value = value.replaceAll('"', '&quot;')
      if (name === 'class') value = (cls + ' ' + value).trim()
      attrs.push(`${name}="${value}"`)
    }
    return attrs.join(' ')
  }
}
