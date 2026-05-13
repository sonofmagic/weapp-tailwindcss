module.exports = {
  plugins: {
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
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
