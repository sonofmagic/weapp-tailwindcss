const platform = process.env.PLATFORM ?? 'weapp'
const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")
const platformMap = {
  weapp: {
    template: 'wxml',
    css: 'wxss'
  },
  tt: {
    template: 'ttml',
    css: 'ttss'
  }
}

const hit = platformMap[platform]

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./src/**/*.{html,js,ts${hit ? ',' + hit.template : ''}}`],
  theme: {
    extend: {}
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(['mdi'])
    })
  ],
  corePlugins: {
    preflight: false
  }
}
