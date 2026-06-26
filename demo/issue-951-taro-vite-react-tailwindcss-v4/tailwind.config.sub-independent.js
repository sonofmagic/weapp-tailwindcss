/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/sub-independent/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'issue-951-independent': '#f59e0b',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
