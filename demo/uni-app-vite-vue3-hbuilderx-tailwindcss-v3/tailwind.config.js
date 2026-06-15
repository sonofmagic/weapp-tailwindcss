const themeVariants = require('../theme-variants.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.vue',
    './pages/**/*.{vue,js,ts}',
    '!./uni_modules/**/*',
    '!./unpackage/**/*',
  ],
  theme: {
    extend: {},
  },
  plugins: [themeVariants],
}
