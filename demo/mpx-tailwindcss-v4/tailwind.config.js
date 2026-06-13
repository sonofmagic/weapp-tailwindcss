const darkMode = require('../dark-mode.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.mpx', '!./src/sub-normal/**/*.mpx', '!./src/sub-independent/**/*.mpx'],
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
