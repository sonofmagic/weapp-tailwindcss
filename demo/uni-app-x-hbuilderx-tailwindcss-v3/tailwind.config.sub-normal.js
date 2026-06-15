const { r } = require('./shared')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [r('./sub-normal/**/*.{uts,uvue}')],
  theme: {
    extend: {
      colors: {
        'normal-subpackage-marker': '#2563eb',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
