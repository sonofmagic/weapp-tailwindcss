const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**/*.{js,wxml}', '!node_modules/**', '!dist/**'],
  theme: {
    extend: {}
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(['mdi'])
    })
  ],
  corePlugins: {
    preflight: false,
    container: false
  }
}
