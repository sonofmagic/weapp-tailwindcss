
console.log('tailwind.config.sub-b')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/moduleB/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
