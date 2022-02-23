// 假如不起作用，请使用内联postcss
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    },
    //'../../postcss': {}
    'weapp-tailwindcss-webpack-plugin/postcss': {}
  }
}
