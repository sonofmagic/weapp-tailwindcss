const path = require('path')

module.exports = {
  entries: [
    { find: '~', replacement: path.resolve(__dirname, './src') },
  ]
}