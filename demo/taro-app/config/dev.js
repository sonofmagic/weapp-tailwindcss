module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {
    // https://docs.taro.zone/docs/config-detail/#terserenable
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/142
    // https://taro-docs.jd.com/docs/compile-optimized
    // 使用的时候没进入本插件的断点
    // webpackChain: (chain, webpack) => {
    //   chain.merge({
    //     plugin: {
    //       install: {

    //         plugin: require('terser-webpack-plugin'),
    //         args: [
    //           {
    //             terserOptions: {
    //               // parallel: 1,
    //               compress: true, // 默认使用terser压缩
    //               // mangle: false,
    //               keep_classnames: true, // 不改变class名称
    //               keep_fnames: true, // 不改变函数名称
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   })
    // },
  },
  h5: {},
};
