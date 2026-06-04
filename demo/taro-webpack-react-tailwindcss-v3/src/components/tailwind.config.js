const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, "./TailwindPrefix.tsx")],
  prefix: 'my-',
  corePlugins: {
    preflight: false
  }
}
