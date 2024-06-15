const { plugin: tailwindcssChildrenPlugin } = require('weapp-tailwindcss-children');
const cssMacro = require('weapp-tailwindcss/css-macro');
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
    container: false,
  },
};
