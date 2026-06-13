const themeVariants = require('../../theme-variants.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [themeVariants],
}
