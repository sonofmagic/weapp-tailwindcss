const { WeappTailwindcss } = require("weapp-tailwindcss/webpack");

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  //....
  configureWebpack: {
    plugins: [
      new WeappTailwindcss({
        rem2rpx: true,
      }),
    ],
  },
  chainWebpack: (config) => {
    // 去除ts类型检测，因为uni-app ts type 支持其实不咋好
    config.plugins.delete('fork-ts-checker')
  },
  //....
};

module.exports = config;
