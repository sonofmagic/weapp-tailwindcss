// const path = require('node:path')
import path from 'path'

export function r(...args) {
  return path.resolve(__dirname, ...args)
}

// module.exports = {
//   r,
// }
