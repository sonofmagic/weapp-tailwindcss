const { r } = require('./shared')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [r('./sub-independent/**/*.{uts,uvue}')],
  theme: {
    extend: {
      colors: {
        'independent-subpackage-marker': '#dc2626',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
