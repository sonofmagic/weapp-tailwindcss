/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sub-independent/**/*.{vue,js,ts}'],
  safelist: [
    'bg-independent-subpackage-marker',
  ],
  theme: {
    extend: {
      colors: {
        'independent-subpackage-marker': '#dc2626',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
}
