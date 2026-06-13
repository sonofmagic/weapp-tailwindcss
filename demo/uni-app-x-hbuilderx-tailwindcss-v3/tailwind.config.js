const { r } = require('./shared')
const themeVariants = require('../theme-variants.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    r('./pages/**/*.{uts,uvue}'),
    r('./components/**/*.{uts,uvue}'),
    `!${r('./uni_modules/**/*')}`,
  ],
  theme: {
    extend: {},
  },
  plugins: [themeVariants],
  corePlugins: {
    preflight: false,
  },
}
