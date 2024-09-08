const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')
const plugin = require('tailwindcss/plugin')
const cssMacro = require('weapp-tailwindcss/css-macro')
const { isMp } = require('./platform')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  // https://tailwindcss.com/docs/dark-mode
  // darkMode: 'class',
  // darkMode: ['variant', ['&:is(.dark *)']],
  darkMode: ['variant', ':is(.dark &)'],
  theme: {
    extend: {
      colors: {
        'primary': 'rgba(var(--ice-color-primary), <alpha-value>)',
        'primary-content':
          'rgba(var(--ice-color-primary-content), <alpha-value>)',
        'base': 'rgba(var(--ice-color-base), <alpha-value>)',
      },
    },
  },
  // https://tw.icebreaker.top/docs/quick-start/uni-app-css-macro
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('deep', ':is(.deep &)')
      addVariant('fantasy', ':is(.fantasy &)')
    }),
    cssMacro({
      variantsMap: {
        'wx': 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true,
        },
      },
    }),
    iconsPlugin({
      collections: getIconCollections(['svg-spinners', 'mdi', 'logos', 'ci', 'ri']),
    }),
  ],
  corePlugins: {
    preflight: !isMp,
    container: !isMp,
  },
}
