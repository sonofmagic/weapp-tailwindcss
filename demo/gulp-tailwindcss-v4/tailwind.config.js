const platform = process.env.PLATFORM ?? 'weapp'
const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")
const darkMode = require('../dark-mode.cjs')
// Iconify HMR 回归会临时注入 i-[...]，关闭旧 i 前缀插件避免同前缀冲突遮盖回归目标。
const disableEgoistIcons = process.env.WEAPP_TW_DISABLE_EGOIST_ICONS === '1'
  || process.env.WEAPP_TW_WATCH_REGRESSION === '1'
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
  darkMode,
  theme: {
    extend: {}
  },
  plugins: disableEgoistIcons
    ? []
    : [
        iconsPlugin({
          collections: getIconCollections(['mdi'])
        })
      ],
  corePlugins: {
    preflight: false
  }
}
