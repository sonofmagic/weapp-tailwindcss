/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**/*.{js,wxml}', '!node_modules/**', '!dist/**'],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false
  }
}
