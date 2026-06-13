const darkMode = require('../../dark-mode.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
}
