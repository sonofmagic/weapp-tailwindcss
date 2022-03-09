module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel/postcss7': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }
  }
}
