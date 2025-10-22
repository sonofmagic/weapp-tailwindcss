const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const bench = require('../bench.cjs')('rax')

module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // console.log(config);
    // compiler.webpack.version 5.65.0
    config.plugin('RaxTailwindcssWebpackPluginV5').use(UnifiedWebpackPluginV5, [
      {
        rem2rpx: true,
        tailwindcssBasedir: __dirname,
        onStart() {
          bench.start()
        },
        onEnd() {
          bench.end()
          bench.dump()
        },

        // cssPreflight: {
        //   'box-sizing': 'content-box',
        //   'background': 'black'
        // }
      },
    ])
  })
}
