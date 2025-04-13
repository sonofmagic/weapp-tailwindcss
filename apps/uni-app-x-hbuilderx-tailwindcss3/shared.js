const path = require('node:path')

function r(...args) {
  return path.resolve(__dirname, ...args)
}

module.exports = {
  r,
}
