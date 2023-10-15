const { each, variants } = require('./variants.js');
const fs = require('node:fs');
const path = require('node:path');
const plugin = require('tailwindcss/plugin');
fs.writeFileSync(path.resolve(__dirname, './variants.json'), JSON.stringify(variants, null, 2), {
  encoding: 'utf-8',
});
const { plugin: tailwindcssChildrenPlugin } = require('weapp-tailwindcss-children');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#45a3fa',
      },
    },
  },
  plugins: [
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
  ],
  presets: [
    require('tailwindcss-rem2px-preset').createPreset({
      fontSize: 32,
      unit: 'rpx',
    }),
  ],
  corePlugins: {
    preflight: false,
  },
};
