module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-pxtransform': {
      platform: 'weapp',
      designWidth: 375,
      deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2,
        375: 2 / 1
      }
    }
    // 'postcss-rem-to-responsive-pixel': {
    //   rootValue: 32,
    //   propList: ['*'],
    //   transformUnit: 'rpx'
    // }
  }
}
