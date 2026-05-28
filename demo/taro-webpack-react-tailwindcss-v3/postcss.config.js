const path = require('node:path')

const isWebHmrRegression = process.env.WEAPP_TW_WATCH_REGRESSION === '1' && process.env.TARO_ENV === 'h5'
const projectRoot = __dirname

module.exports = function config(loaderContext) {
  return {
    plugins: {
      // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
      ...(isWebHmrRegression
        ? {
            'weapp-tailwindcss/postcss': {
              version: 3,
              config: path.resolve(projectRoot, 'tailwind.config.js'),
              projectRoot,
              generator: {
                target: 'web',
              },
            },
          }
        : {}),
      autoprefixer: {},
    }
  }
}
