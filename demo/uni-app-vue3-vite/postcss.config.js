// 发现添加 postcss.config.js 不起作用

// module.exports = {
//   plugins: {
//     autoprefixer: {},
//     tailwindcss: {},
//     'postcss-rem-to-responsive-pixel': {
//       rootValue: 32,
//       propList: ['*'],
//       transformUnit: 'rpx'
//     }
//   }
// }

// module.exports = function (ctx) {
//   console.log(ctx)
//   return {
//     // parser: ctx.parser ? 'sugarss' : false,
//     // syntax: ctx.syntax ? 'sugarss' : false,
//     // map: ctx.map ? 'inline' : false,
//     // from: './test/js/object/fixtures/index.css',
//     // to: './test/js/object/expect/index.css',
//     plugins: {
//       autoprefixer: {},
//       tailwindcss: {},
//       'postcss-rem-to-responsive-pixel': {
//         rootValue: 32,
//         propList: ['*'],
//         transformUnit: 'rpx'
//       }
//     }
//   }
// }
