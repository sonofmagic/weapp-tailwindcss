const { defineConfig } = require('@vue/cli-service')
const { StyleInjector } = require('weapp-style-injector/webpack/mpx')
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
      StyleInjector({
        include: ['sub-normal/**/*.wxss', 'sub-independent/**/*.wxss'],
        styleEntries: [
          {
            sourceFileName: 'index.css',
          },
          {
            sourceFileName: 'scss.scss',
            include: ['pages/**/*.wxss'],
          },
          {
            sourceFileName: 'less.less',
            include: ['pages/**/*.wxss'],
          },
        ],
      }),
    )
  },
  chainWebpack(config) {
    config.plugins.delete('fork-ts-checker')
  },
})
