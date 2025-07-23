const { r } = require('./shared')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    r('./pages/**/*.{uts,uvue}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
