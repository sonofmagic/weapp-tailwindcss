// 假如不起作用，请使用内联postcss
const isH5 = process.env.UNI_PLATFORM === 'h5';
const isApp = process.env.UNI_PLATFORM === 'app-plus';
const WeappTailwindcssDisabled = isH5 || isApp;

const plugins = [require('autoprefixer')(), require('tailwindcss')()];

if (!WeappTailwindcssDisabled) {
  plugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx',
    })
  );

  // plugins.push(require('weapp-tailwindcss/postcss')());
}

module.exports = {
  plugins,
};
