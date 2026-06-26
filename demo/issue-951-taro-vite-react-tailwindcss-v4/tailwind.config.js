/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    '!./src/sub-normal/**/*.{ts,tsx}',
    '!./src/sub-independent/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'issue-951-main': '#0f766e',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
