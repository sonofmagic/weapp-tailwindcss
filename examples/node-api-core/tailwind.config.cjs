const path = require('node:path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, 'src/**/*.{ts,js}')],
  corePlugins: {
    container: false,
    preflight: false,
  },
}
