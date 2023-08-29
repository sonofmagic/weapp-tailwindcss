/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://github.com/mrmlnc/fast-glob
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    // 独立分包
    "!./src/moduleB/**/*.{html,js,ts,jsx,tsx}",
    "!./src/moduleC/**/*.{html,js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  corePlugins: {
    preflight: false
  }
}
