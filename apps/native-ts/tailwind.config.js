/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['miniprogram/**/*.{ts,js,wxml}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    container: false,
    preflight: false
  }
}

