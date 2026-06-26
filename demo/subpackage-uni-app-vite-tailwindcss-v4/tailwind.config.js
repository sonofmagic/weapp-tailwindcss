/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'twv4-uni-main': '#0369a1',
        'twv4-uni-normal': '#9333ea',
        'twv4-uni-independent': '#d97706',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
