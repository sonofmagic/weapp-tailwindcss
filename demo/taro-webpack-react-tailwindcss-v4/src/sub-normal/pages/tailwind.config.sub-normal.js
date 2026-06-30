/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
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
