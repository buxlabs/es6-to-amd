const Module = require('./src/class/Module')

module.exports = function converter (source) {
  if (source.indexOf('import') === -1 && source.indexOf('export') === -1) {
    return source
  }
  const module = new Module(source)
  module.convert()
  return module.source
}
