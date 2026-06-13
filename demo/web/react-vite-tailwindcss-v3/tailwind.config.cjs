const themeVariants = require('../../theme-variants.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [themeVariants],
}
