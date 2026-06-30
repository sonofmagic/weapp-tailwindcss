/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
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
