module.exports = {
  content: ['./src/sub-independent/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        'independent-subpackage-marker': '#dc2626',
      },
    },
  },
  corePlugins: {
    container: false,
    preflight: false,
  },
}
