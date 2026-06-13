const darkMode = require('../dark-mode.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{wxml,html,js,ts,jsx,tsx}',
    '!./src/sub-normal/**/*.{wxml,html,js,ts,jsx,tsx}',
    '!./src/sub-independent/**/*.{wxml,html,js,ts,jsx,tsx}',
  ],
  darkMode,
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
