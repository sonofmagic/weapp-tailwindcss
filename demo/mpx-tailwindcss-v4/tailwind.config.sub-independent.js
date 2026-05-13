/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/sub-independent/**/*.mpx'],
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
