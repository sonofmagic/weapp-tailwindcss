const base = require('./tailwind.config.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: ['./src/sub-independent/**/*.{vue,js,ts}'],
}
