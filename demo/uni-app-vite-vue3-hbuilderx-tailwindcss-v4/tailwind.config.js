/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.vue',
    './pages/**/*.{vue,js,ts}',
    '!./uni_modules/**/*',
    '!./unpackage/**/*',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
