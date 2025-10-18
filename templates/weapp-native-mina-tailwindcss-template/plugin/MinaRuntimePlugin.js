/* eslint-disable no-bitwise */
/*
 * forked from https://github.com/Cap32/wxapp-webpack-plugin/
 */
const path = require('path')
const ensurePosix = require('ensure-posix-path')
const fs = require('fs')
const { ConcatSource } = require('webpack-sources')
const requiredPath = require('required-path')
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')

function isRuntimeExtracted(compilation) {
  return [...compilation.chunks].some(
    chunk => chunk.isOnlyInitial() && chunk.hasRuntime() && compilation.chunkGraph.getNumberOfEntryModules(chunk) === 0,
  )
}

function script({ dependencies }) {
  return ';' + dependencies.map(file => `require('${requiredPath(file)}');`).join('')
}

module.exports = class MinaRuntimeWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MinaRuntimePlugin', compilation => {
      JavascriptModulesPlugin.getCompilationHooks(compilation).render.tap(
        'MinaRuntimePlugin',
        (source, renderContext) => {
          if (!isRuntimeExtracted(compilation)) {
            throw new Error(
              [
                'Please reuse the runtime chunk to avoid duplicate loading of javascript files.',
                "Simple solution: set `optimization.runtimeChunk` to `{ name: 'runtime.js' }` .",
                'Detail of `optimization.runtimeChunk`: https://webpack.js.org/configuration/optimization/#optimization-runtimechunk .',
              ].join('\n'),
            )
          }
          return concatenateDependenciesAndFile(compilation, source, renderContext.chunk)
        },
      )
      compilation.mainTemplate.hooks.bootstrap.tap('MinaRuntimePlugin', (source, chunk) => {
        console.log('mainTemplate,bootstrap chunk name', chunk.name)
        const polyfill = fs.readFileSync(path.join(__dirname, './polyfill.js'), 'utf8') + ';'
        return polyfill + source
      })
    })
  }
}

const concatenateDependenciesAndFile = (compilation, source, entry) => {
  console.log('-----------------------------------------------')
  console.log(`entry name:${entry.name} entry id:${entry.id}`)
  if (compilation.chunkGraph.getNumberOfEntryModules(entry) === 0) {
    return source
  }

  const dependencies = []
  entry.groupsIterable.forEach(group => {
    console.log(`group name:${group.name}`)
    group.chunks.forEach(chunk => {
      console.log(`chunk name:${chunk.name} chunk id:${chunk.id}`)
      /**
       * assume output.filename is chunk.name here
       */
      const filename = ensurePosix(path.relative(path.dirname(entry.name), chunk.name))
      if (chunk === entry || ~dependencies.indexOf(filename)) {
        return
      }
      dependencies.push(filename)
    })
  })
  console.log(`dependencies of ${entry.name}:`, dependencies)
  source = new ConcatSource(script({ dependencies }), source)
  return source
}
