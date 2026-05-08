module.exports = {
  plugins: process.env.WEAPP_TW_GENERATOR_MODE === 'legacy' ? [
    require('@tailwindcss/postcss')()
    // require('autoprefixer')({ remove: false })
  ] : []
}
