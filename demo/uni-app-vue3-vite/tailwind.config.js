// const { each, variants } = require('./variants.js');
// const fs = require('node:fs');
const path = require('node:path');
const plugin = require('tailwindcss/plugin');
// fs.writeFileSync(path.resolve(__dirname, './variants.json'), JSON.stringify(variants, null, 2), {
//   encoding: 'utf8',
// });
function r(...args) {
  return path.resolve(__dirname, ...args);
}
const cssMacro = require('weapp-tailwindcss/css-macro');
const { plugin: tailwindcssChildrenPlugin } = require('weapp-tailwindcss-children');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'].map((x) => r(x)), // ,
  darkMode: 'class',
  // important: '.app',
  theme: {
    extend: {
      colors: {
        primary: '#45a3fa',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/aspect-ratio'),
    tailwindcssChildrenPlugin,
    // require('daisyui'),
    /*  #ifdef  %PLATFORM%  */
    // 平台特有样式
    /*  #endif  */
    // https://github.com/tailwindlabs/tailwindcss/blob/master/src/lib/setupContextUtils.js#L224
    plugin(({ addVariant }) => {
      // addVariant('wx', '@/*#ifdef MP-WEIXIN*/\n&\n/*#endif*/');
      // @media (hover: hover) {
      addVariant('wx', '@media(weapp-tw-platform:MP-WEIXIN){&}');
    }),
    cssMacro({
      variantsMap: {
        wx: 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true,
        },
        mv: {
          value: 'H5 || MP-WEIXIN',
        },
        '-mv': {
          value: 'H5 || MP-WEIXIN',
          negative: true,
        },
      },
    }),
  ],
  presets: [
    require('tailwindcss-rem2px-preset').createPreset({
      fontSize: 32,
      unit: 'rpx',
    }),
  ],
  corePlugins: {
    preflight: false,
    aspectRatio: false,
  },
};
