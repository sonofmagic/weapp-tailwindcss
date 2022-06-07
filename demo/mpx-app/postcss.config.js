module.exports = {
  plugins: [
    require('tailwindcss')(),
    require('autoprefixer')({ remove: false }),
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  ]
}
