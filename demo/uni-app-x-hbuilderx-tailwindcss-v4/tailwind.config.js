import darkMode from '../dark-mode.cjs'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './App.uvue',
    './pages/**/*.{uts,uvue}',
    './components/**/*.{uts,uvue}',
    './stores/**/*.{uts,uvue}',
    '!./uni_modules/**/*',
    '!./unpackage/**/*',
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
