
console.log('tailwind.config.sub-c')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/moduleC/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
