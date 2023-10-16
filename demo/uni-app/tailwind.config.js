const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')
const cssMacro = require('weapp-tailwindcss-webpack-plugin/css-macro')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx,wxml}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {},
  plugins: [
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['mdi'])
    }),
    cssMacro({
      variantsMap: {
        wx: 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true
        },
        mv: {
          value: 'H5 || MP-WEIXIN'
        },
        '-mv': {
          value: 'H5 || MP-WEIXIN',
          negative: true
        }
      }
    })
  ],
  corePlugins: {
    preflight: false
  }
}
