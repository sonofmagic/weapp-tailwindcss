import type { UserDefinedOptions } from './types'
import type { Compiler, Chunk } from 'webpack4'
import postcss from 'postcss'
import { ReplaceSource, ConcatSource } from 'webpack-sources'

const pluginName = 'weapp-tailwindcss-webpack-plugin'
// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class UniAppWeappTailwindcssWebpackPluginV4 {
  opts: UserDefinedOptions
  constructor (opts = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    // @ts-ignore
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise(
        pluginName,
        async (_chunks) => {
          const chunks: Chunk[] = _chunks as unknown as Chunk[]
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            const chunkFiles = chunk.files
            for (let j = 0; j < chunkFiles.length; j++) {
              const file = chunkFiles[j]
              const originalSource = compilation.assets[file]
              // originalSource id/name
              console.log(file)
              // uni * ?
              if (
                file.match(/.+\.wxss.*$/)
                // ||
                // @ts-ignore
                // originalSource.name === 'mini-css-extract-plugin'
              ) {
                const rawSource = originalSource.source()
                const root = postcss.parse(rawSource)
                root.walk((node, idx) => {
                  if (node.type === 'rule') {
                    const rep = node.selector
                      .replace(/\\\[/g, '_l_')
                      .replace(/\\\]/g, '_r_')
                      .replace(/\\\(/g, '_p_')
                      .replace(/\\\)/g, '_q_')
                      .replace(/\\#/g, '_h_')
                      .replace(/\\\//g, '-div-')
                      .replace(/\\\./g, '-dot-')
                    node.selector = rep
                  } else if (node.type === 'comment') {
                    node.remove()
                  }
                })
                const css = root.toString()
                const source = new ConcatSource(css)
                // @ts-ignore
                compilation.updateAsset(file, source)
              } else if (file.match(/.+\.wxml.*$/)) {
                // file.match(/.+\.js.*$/) ||
                const rawSource = originalSource.source().toString()
                const regex = /class="(.+)"/g

                let match
                // @ts-ignore
                const source = new ReplaceSource(originalSource)
                while ((match = regex.exec(rawSource))) {
                  const original = match[1] as string
                  const startPos = match.index + match[0].indexOf(original)
                  const endPos = startPos + original.length - 1
                  const newClassName = original
                    .replace(/\[/g, '_l_')
                    .replace(/\]/g, '_r_')
                    .replace(/\(/g, '_p_')
                    .replace(/\)/g, '_q_')
                    .replace(/#/g, '_h_')
                    .replace(/\//g, '-div-')
                    .replace(/\./g, '-dot-')
                  source.replace(startPos, endPos, newClassName)
                }
                // @ts-ignore
                compilation.updateAsset(file, source)
              }
            }
          }
        }
      )
      // compilation.hooks.
    })
  }
}
