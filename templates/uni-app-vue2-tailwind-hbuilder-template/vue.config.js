const path = require('path')

if (process.env.NODE_ENV === "development") {
  process.env.TAILWIND_MODE = "watch";
  // require('dotenv').config({
  //   path: path.resolve(__dirname, '.env.development')
  // })
}

console.log('NODE_ENV:' + process.env.NODE_ENV)
console.log('TAILWIND_MODE:' + process.env.TAILWIND_MODE)
const { WeappTailwindcssDisabled } = require("./platform");

const {
  UnifiedWebpackPluginV4
} = require("weapp-tailwindcss/webpack4");

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  //....
  configureWebpack: {
    plugins: [
      new UnifiedWebpackPluginV4({
        rem2rpx: true,
        disabled: WeappTailwindcssDisabled,
      }),
    ],
  },
  //....
};

module.exports = config;
