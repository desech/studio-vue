module.exports = {
  toPascalCase (string) {
    return string.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ''
      return match.toUpperCase()
    }).replace(/\W/g, '')
  },

  isEmpty (obj) {
    return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object)
  },

  unique (array) {
    return [...new Set(array)]
  }
}
