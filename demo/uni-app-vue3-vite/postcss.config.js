// 假如不起作用，请使用内联postcss
const isH5 = process.env.UNI_PLATFORM === 'h5';

module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('tailwindcss')(),
    isH5
      ? undefined
      : require('postcss-rem-to-responsive-pixel')({
          rootValue: 32,
          propList: ['*'],
          transformUnit: 'rpx'
        }),
    isH5 ? undefined : require('weapp-tailwindcss-webpack-plugin/postcss')()
  ]
};
