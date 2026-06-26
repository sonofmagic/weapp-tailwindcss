const base = require('./tailwind.config.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/sub-normal/**/*.{ts,tsx}',
    './src/sub-independent/**/*.{ts,tsx}',
  ],
}
