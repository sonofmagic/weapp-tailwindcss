/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/sub-normal/**/*.mpx'],
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
