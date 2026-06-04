/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.mpx', '!./src/sub-normal/**/*.mpx', '!./src/sub-independent/**/*.mpx'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
