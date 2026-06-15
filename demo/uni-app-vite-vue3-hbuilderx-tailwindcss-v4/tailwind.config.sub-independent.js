/** @type {import('tailwindcss').Config} */
export default {
  content: ['./sub-independent/**/*.{vue,js,ts}'],
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
