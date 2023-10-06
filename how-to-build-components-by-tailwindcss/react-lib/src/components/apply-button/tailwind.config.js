const path = require('path')
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, './index.tsx')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

