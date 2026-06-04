/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/moduleA/**/*.{wxml,html,js,ts,jsx,tsx,vue,mpx}'],
  theme: {
    extend: {
      colors: {
        'module-a-subpackage-marker': '#7c3aed',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
