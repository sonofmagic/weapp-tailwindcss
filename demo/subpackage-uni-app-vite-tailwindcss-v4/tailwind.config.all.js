const base = require('./tailwind.config.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [
    './src/pages/**/*.{vue,js,ts}',
    './src/sub-normal/**/*.{vue,js,ts}',
    './src/sub-independent/**/*.{vue,js,ts}',
  ],
}
