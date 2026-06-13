const darkMode = require('../../dark-mode.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
}
