module.exports = {
  plugins: {
    'autoprefixer': {},
    'tailwindcss': {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx',
    },
  },
}
