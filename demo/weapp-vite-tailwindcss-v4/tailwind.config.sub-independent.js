/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sub-independent/**/*.{wxml,html,js,ts,jsx,tsx,vue}'],
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
