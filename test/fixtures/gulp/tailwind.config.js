const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, "./src/*.{js,wxml}")],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
