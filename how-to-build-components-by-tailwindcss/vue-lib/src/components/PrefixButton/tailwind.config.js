const path = require('node:path')

/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'ice-',
  content: [path.resolve(__dirname, './index.vue')],
  theme: {
    extend: {}
  },
  plugins: []
}
