const darkMode = require('../dark-mode.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{wxml,html,js,ts,vue}',
    '!./src/sub-normal/**/*.{wxml,html,js,ts,vue}',
    '!./src/sub-independent/**/*.{wxml,html,js,ts,vue}',
  ],
  darkMode,
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
