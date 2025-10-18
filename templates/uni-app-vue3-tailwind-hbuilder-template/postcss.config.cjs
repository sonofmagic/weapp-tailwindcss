/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('./shared')

const plugins = [
    require('tailwindcss')(
        {
            config: resolve("./tailwind.config.js"),
        }
    ),
    require('autoprefixer')()]

// if (!WeappTailwindcssDisabled) {
// px 转 rpx 功能
// plugins.push(
//   require('postcss-pxtransform')({
//     platform: 'weapp',
//     // https://taro-docs.jd.com/docs/size
//     // 根据你的设计稿宽度进行配置
//     // 可以传入一个 function
//     // designWidth (input) {
//     //   if (input.file.replace(/\\+/g, '/').indexOf('@nutui/nutui-taro') > -1) {
//     //     return 375
//     //   }
//     //   return 750
//     // },
//     designWidth: 750, // 375,

//     deviceRatio: {
//       640: 2.34 / 2,
//       // 此时应用到的规则，代表 1px = 1rpx
//       750: 1,
//       828: 1.81 / 2,
//       // 假如你把 designWidth 设置成 375 则使用这条规则 1px = 2rpx
//       375: 2 / 1
//     }
//   })
// )
// }
plugins.push(require('weapp-tailwindcss/css-macro/postcss'))

module.exports = {
    plugins
}
