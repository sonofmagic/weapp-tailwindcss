/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/sub-normal/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'issue-951-normal': '#7c3aed',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
