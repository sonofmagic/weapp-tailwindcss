const { default: weappTailwindcss } = require('weapp-tailwindcss/postcss')

module.exports = {
  plugins: [
    weappTailwindcss({
      generator: {
        mode: 'force',
        target: 'weapp'
      }
    })
    // require('autoprefixer')({ remove: false })
  ]
}
