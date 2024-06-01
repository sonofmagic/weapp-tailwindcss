const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**/*.{js,wxml}', '!node_modules/**', '!dist/**'],
  theme: {
    extend: {}
  },
  plugins: [
    // https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/wxss.html
    iconsPlugin({
      collections: getIconCollections(["mdi", "lucide"]),
      extraProperties: {}
    }),
  ],
  corePlugins: {
    preflight: false,
    container: false
  }
}
