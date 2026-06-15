/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sub-normal/**/*.{vue,js,ts}'],
  safelist: [
    'bg-normal-subpackage-marker',
  ],
  theme: {
    extend: {
      colors: {
        'normal-subpackage-marker': '#2563eb',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
