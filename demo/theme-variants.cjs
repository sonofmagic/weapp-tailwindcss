const plugin = require('tailwindcss/plugin')

module.exports = plugin(({ addVariant }) => {
  addVariant('system-dark', '@media (prefers-color-scheme: dark)')
  addVariant('theme-dark', ['&.theme-dark', '.theme-dark &'])
})
