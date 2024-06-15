const path = require('node:path')
const webpack = require('webpack')
// const { WeappTailwindcssDisabled } = require('./platform')
const config = {
  parser: require('postcss-comment'),
  plugins: [
    require('postcss-import')({
      resolve(id, basedir, importOptions) {
        if (id.startsWith('~@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(3))
        } else if (id.startsWith('@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(2))
        } else if (id.startsWith('/') && !id.startsWith('//')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.slice(1))
        }
        return id
      }
    }),
    require('tailwindcss')({ config: './tailwind.config.js' }),
    // rem 转 rpx
    // WeappTailwindcssDisabled
    //   ? undefined
    //   : require('postcss-rem-to-responsive-pixel')({
    //       rootValue: 32,
    //       propList: ['*'],
    //       transformUnit: 'rpx'
    //     }),
    require('weapp-tailwindcss/css-macro/postcss'),
    require('autoprefixer')({
      remove: process.env.UNI_PLATFORM !== 'h5'
    }),
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')
  ]
}
if (webpack.version[0] > 4) {
  delete config.parser
}
module.exports = config
