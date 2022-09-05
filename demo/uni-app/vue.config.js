const { UniAppWeappTailwindcssWebpackPluginV4 } = require('../..')
const { WeappTailwindcssDisabled } = require('./platform')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin({
  //outputTarget: './smp.dat',
})
// const { UniAppWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  transpileDependencies: ['uview-ui'],
  configureWebpack: (config) => {
    let now
    config.plugins.push(
      new UniAppWeappTailwindcssWebpackPluginV4({
        disabled: WeappTailwindcssDisabled,
        // onLoad() {
        //   console.log(`UniAppWeappTailwindcssWebpackPluginV4 onLoad`)
        // },
        // onStart() {
        //   now = Date.now()
        //   // console.log(`onStart:${Date.now() - now}ms`)
        // },
        // onUpdate(file) {
        //   console.log(file)
        // },
        // onEnd() {
        //   console.log(`onEnd:${Date.now() - now}ms`)
        // },
        mangle: {
          log: true,
          // ignoreClass: ['bg-[#123456]'],
          ignoreClass: [/^bg-/]
        }
      })
    )
    smp.wrap(config)
  }
}

module.exports = config
