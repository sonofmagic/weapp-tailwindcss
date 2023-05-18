/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx,wxml}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
