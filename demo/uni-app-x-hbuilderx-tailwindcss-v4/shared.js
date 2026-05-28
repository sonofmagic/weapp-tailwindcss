const path = require('node:path')

function r(...args) {
  return path.resolve(__dirname, ...args)
}

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'

module.exports = {
  r,
  isH5,
  isApp,
}
