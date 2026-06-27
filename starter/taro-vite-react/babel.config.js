const process = require('node:process')

module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'vite',
      useBuiltIns: process.env.TARO_ENV === 'h5' ? 'usage' : false,
    }],
  ],
}
