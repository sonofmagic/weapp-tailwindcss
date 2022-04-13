// 假如不起作用，请使用内联postcss
const isH5 = process.env.UNI_PLATFORM === 'h5';

const plugins = [require('autoprefixer')(), require('tailwindcss')()];

if (!isH5) {
  plugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  );

  plugins.push(require('weapp-tailwindcss-webpack-plugin/postcss')());
}

module.exports = {
  plugins
};
