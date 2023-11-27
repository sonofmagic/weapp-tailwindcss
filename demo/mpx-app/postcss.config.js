module.exports = {
  plugins: [
    require('tailwindcss')(),
    require('autoprefixer')({ remove: false })
    // require('postcss-rem-to-responsive-pixel')({
    //   // 下面这段配置项的意思是，1rem转化为32rpx，* 的意思是所有的 rem 会被转化
    //   rootValue: 32,
    //   propList: ['*'],
    //   transformUnit: 'rpx'
    // })
  ]
}
