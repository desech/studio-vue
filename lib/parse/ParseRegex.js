const Html = require('../Html.js')
const ExtendJS = require('../ExtendJS.js')

module.exports = {
  // make sure to have very little regex code because of how complicated html parsing is
  regexHtmlRender (file, data, componentObj, document, lib) {
    let html = file.isComponent ? document.body.innerHTML : document.body.outerHTML
    // no global regex because we only need it once
    html = html.replace(/<body([\s\S]*?)<\/body>/, '<div$1</div>')
    html = this.addRootElementData(html)
    html = this.addComponentData(html, data)
    html = Html.beautifyHtml(html.replace(/\r?\n/g, '\n'), lib.beautify, 1)
    return html + '\n  '
  },

  // :class="['e0ref', 'block', d.e0refClsRed]"
  buildClassesAttribute (array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] !== 'd.componentRef' && !array[i].startsWith('d.e0')) {
        array[i] = "'" + array[i] + "'"
      }
    }
    return `:class="[${array.join(', ')}]"`
  },

  addRootElementData (html) {
    html = this.addRootElementClass(html)
    html = this.addRootElementVariants(html)
    return html
  },

  // this happens after we have added the class overrides
  // class="e0ref block" or :class="['e0ref', 'block', d.e0refClsRed]"
  addRootElementClass (html) {
    return html.replace(/:?class="(.*?__ROOT_CLASS__.*?)"/g, (match, string) => {
      const array = this.extractClasses(string)
      for (let i = 0; i < array.length; i++) {
        if (array[i] === '__ROOT_CLASS__') {
          array[i] = 'd.componentRef'
        }
      }
      return this.buildClassesAttribute(array)
    })
  },

  extractClasses (string) {
    if (string.startsWith('[')) {
      // :class="['e0ref', 'block', '__ROOT_CLASS__', d.e0refClsRed]"
      const array = string.substring(1, string.length - 2).split(', ')
      for (let i = 0; i < array.length; i++) {
        if (array[i].startsWith("'")) {
          array[i] = array[i].substring(1, array[i].length - 2)
        }
      }
      return array
    } else {
      // class="e0ref block __ROOT_CLASS__"
      return string.split(' ')
    }
  },

  addRootElementVariants (html) {
    return html.replace(/__ROOT_VARIANTS__=""/g, (match) => {
      // we want data-variant="" all the time because of how css works
      return 'data-variant="d.componentVariants"'
    })
  },

  addComponentData (html, data) {
    html = html.replace(/__COMPONENT_REF__="(e0[a-z0-9]+)"/g, (match, ref) => `d-ref="${ref}"`)
    html = html.replace(/__COMPONENT_OVERRIDES__(e0[a-z0-9]+)=""/g, (match, ref) => {
      return ':d-overrides="d.' + ref + 'Overrides"'
    })
    html = this.addComponentVariants(html, data.component.variants)
    return html
  },

  addComponentVariants (html, variants) {
    return html.replace(/__COMPONENT_VARIANTS__(e0[a-z0-9]+)="(.*?)"/g, (match, ref, file) => {
      return this.buildVariants(ref, variants[file])
    })
  },

  buildVariants (ref, variants) {
    if (!variants) return ''
    const list = []
    for (const name of variants) {
      const attr = `:d-var-${ExtendJS.toKebab(name)}={d.${ref}Var${ExtendJS.toPascalCase(name)}}`
      list.push(attr)
    }
    return list.join(' ')
  }
}
