
// /**
//  * @param {import('webpack').LoaderContext<object>} loaderContext
//  */
// loaderContext.webpackLoaderContext.resourcePath
const path = require('path')

module.exports = function config(loaderContext) {
  const isIndependentModule = /moduleB[/\\](?:\w+[/\\])*\w+\.scss$/.test(
    loaderContext.file
  )
  if (isIndependentModule) {
    return {
      plugins: {
        tailwindcss: {
          config: path.resolve(__dirname, 'tailwind.config.sub.js')
        },
        autoprefixer: {},
      }
    }
  }
  return {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  }
}


