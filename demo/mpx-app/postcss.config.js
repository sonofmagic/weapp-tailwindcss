module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: { remove: false },
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }
  }
}
