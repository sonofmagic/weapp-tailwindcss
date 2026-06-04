/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sub-normal/**/*.{wxml,html,js,ts,jsx,tsx,vue}'],
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
