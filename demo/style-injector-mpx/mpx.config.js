const { defineConfig } = require('@vue/cli-service')
const { weappStyleInjectorWebpack } = require('weapp-style-injector/webpack')
const path = require('path')

const ObjectMiddleware = require('webpack/lib/serialization/ObjectMiddleware')
const originalRegister = ObjectMiddleware.register
ObjectMiddleware.register = function safeRegister(Constructor, request, name, serializer) {
  try {
    return originalRegister.call(this, Constructor, request, name, serializer)
  }
  catch (error) {
    if (error && error.message && error.message.includes('is already registered')) {
      return
    }
    throw error
  }
}

function subpackageStyle(root, marker) {
  return {
    root,
    sourceRelativePath: `${root}/index.css`,
    sourceAbsolutePath: path.resolve(__dirname, `src/${root}/index.css`),
    outputName: 'index',
    preprocess: false,
    framework: 'mpx',
    generate() {
      return marker
    },
  }
}

module.exports = defineConfig({
  outputDir: 'dist/wx',
  pluginOptions: {
    mpx: {
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [],
        },
        srcMode: 'wx',
        hackResolveBuildDependencies: ({ files, resolveDependencies }) => {
          const packageJSONPath = path.resolve('package.json')
          if (files.has(packageJSONPath)) files.delete(packageJSONPath)
          if (resolveDependencies.files.has(packageJSONPath)) {
            resolveDependencies.files.delete(packageJSONPath)
          }
        },
      },
      loader: {},
    },
  },
  configureWebpack(config) {
    config.cache = false
    config.plugins.push(
      weappStyleInjectorWebpack({
        include: ['**/*.wxss'],
        subpackageStyleScopes: [
          subpackageStyle('sub-normal', '.injector-mpx-normal { color: #166534; }'),
          subpackageStyle('sub-independent', '.injector-mpx-independent { color: #7c2d12; }'),
        ],
      }),
    )
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  },
})
