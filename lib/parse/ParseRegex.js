const Html = require('../Html.js')

module.exports = {
  regexHtmlRender (file, data, document, lib) {
    let html = file.isComponent ? document.body.innerHTML : document.body.outerHTML
    html = html.replace(/<body([\s\S]*?)<\/body>/g, '<div$1</div>')
    html = this.replaceLinks(html)
    html = this.replaceShortAttributes(html)
    // html = this.addElementProperties(html)
    html = '<template>' + html.replace(/\r?\n/g, '\n') + '</template>'
    return Html.beautifyHtml(html, lib.beautify) + '\n'
  },

  replaceLinks (html) {
    const regex = /<a(.*?)href="(.*?)"(.*?)>([\s\S]*?)<\/a>/g
    return html.replace(regex, (match, extra1, url, extra2, text) => {
      return url.startsWith('http')
        ? `<a${extra1}href="${url}"${extra2}>${text}</a>`
        : `<router-link${extra1}to="${url}"${extra2}>${text}</router-link>`
    })
  },

  replaceShortAttributes (html) {
    return html.replace(/ (hidden|checked|selected|disabled|readonly|required|multiple|controls|autoplay|loop|muted|default|reversed)=".*?"/g, ' $1')
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
