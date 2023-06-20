
// /**
//  * @param {import('webpack').LoaderContext<object>} loaderContext
//  */
// loaderContext.webpackLoaderContext.resourcePath
const path = require('path')

module.exports = function config(loaderContext) {
  // 独立分包
  const isBModule = /moduleB[/\\](?:\w+[/\\])*\w+\.scss$/.test(
    loaderContext.file
  )
  const isCModule = /moduleC[/\\](?:\w+[/\\])*\w+\.scss$/.test(
    loaderContext.file
  )
  if (isBModule) {
    return {
      plugins: {
        tailwindcss: {
          config: path.resolve(__dirname, 'tailwind.config.sub-b.js')
        },
        autoprefixer: {},
      }
    }
  }
  if (isCModule) {
    return {
      plugins: {
        tailwindcss: {
          config: path.resolve(__dirname, 'tailwind.config.sub-c.js')
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


