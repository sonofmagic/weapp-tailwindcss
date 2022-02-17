
// postcss.config.js
// const rem2rpx = require('postcss-rem-to-responsive-pixel/postcss7')
// https://github.com/postcss/postcss-load-config/blob/main/src/plugins.js
module.exports = ({ options }) => ({
  plugins: {
    // 继承 remax 默认的插件配置
    ...options.plugins,
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel/postcss7': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }
    // 添加其他插件
    // 'postcss-url': { url: 'inline', maxSize: 15 }
  }
})
