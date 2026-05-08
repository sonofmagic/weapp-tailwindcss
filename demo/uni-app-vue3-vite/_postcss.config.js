// 假如不起作用，请使用内联postcss
const isH5 = process.env.UNI_PLATFORM === 'h5';
const isApp = process.env.UNI_PLATFORM === 'app-plus';
const WeappTailwindcssDisabled = isH5 || isApp;

// Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
const plugins = [require('autoprefixer')()];

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
