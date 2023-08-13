const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')
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
    })
  ],
  corePlugins: {
    preflight: false
  }
}
