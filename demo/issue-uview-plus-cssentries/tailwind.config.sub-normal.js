module.exports = {
  content: ['./src/sub-normal/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        'normal-subpackage-marker': '#2563eb',
      },
    },
  },
  corePlugins: {
    container: false,
    preflight: false,
  },
}
