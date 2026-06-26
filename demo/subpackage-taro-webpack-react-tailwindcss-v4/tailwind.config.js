/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'twv4-taro-main': '#0f766e',
        'twv4-taro-normal': '#7c3aed',
        'twv4-taro-independent': '#f59e0b',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
