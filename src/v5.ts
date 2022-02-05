import type { UserDefinedOptions } from './types'
import type { Compiler } from 'webpack'
import type { styleHandler, templeteHandler, pluginName } from './shared'

export class UniAppWeappTailwindcssWebpackPluginV5 {
  options: UserDefinedOptions
  constructor (options = {}) {
    this.options = options
  }

  apply (compiler: Compiler) {
    // const isWebpack5 = Boolean(compiler.webpack)
    // const { ConcatSource } = compiler.webpack.sources
    // compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
    //   const entries = Object.entries(compilation.assets)
    //   console.log(entries)
    // })
    // const majorVersion = semverMajor(compiler.webpack.version)
    // const isWebpack4 = majorVersion === 4
    // const isWebpack5 = majorVersion === 5
    // webpack 4 optimizeChunkAssets
    // webpack 5 processAssets
    // const hookName = isWebpack5 ? 'processAssets' : 'optimizeChunkAssets'
    // compiler.hooks.compilation.tap(pluginName, (compilation) => {
    //   compilation.hooks.optimizeChunkAssets.tapPromise(
    //     pluginName,
    //     async (assets) => {
    //       const entries = Object.entries(assets)
    //       for (let i = 0; i < entries.length; i++) {
    //         const [file, originalSource] = entries[i]
    //         // originalSource id/name
    //         if (
    //           file.match(/.+\.css.*$/)
    //           // @ts-ignore
    //           // originalSource.name === 'mini-css-extract-plugin'
    //         ) {
    //           const rawSource = originalSource.source().toString()
    //           const root = postcss.parse(rawSource)
    //           root.walk((node, idx) => {
    //             if (node.type === 'rule') {
    //               const rep = node.selector
    //                 .replace(/\\\[/g, '_l_')
    //                 .replace(/\\\]/g, '_r_')
    //                 .replace(/\\\(/g, '_p_')
    //                 .replace(/\\\)/g, '_q_')
    //                 .replace(/\\#/g, '_h_')
    //                 .replace(/\\\//g, '-div-')
    //                 .replace(/\\\./g, '-dot-')
    //               node.selector = rep
    //             } else if (node.type === 'comment') {
    //               node.remove()
    //             }
    //           })
    //           const css = root.toString()
    //           const source = new ConcatSource(css)
    //           // @ts-ignore
    //           compilation.updateAsset(file, source)
    //         } else if (file.match(/.+\.js.*$/) || file.match(/.+\.html.*$/)) {
    //           const rawSource = originalSource.source().toString()
    //           const regex = /class="(.+)"/g
    //           let match
    //           // @ts-ignore
    //           const source = new ReplaceSource(originalSource)
    //           while ((match = regex.exec(rawSource))) {
    //             const original = match[1] as string
    //             const startPos = match.index + match[0].indexOf(original)
    //             const endPos = startPos + original.length - 1
    //             const newClassName = original
    //               .replace(/\[/g, '_l_')
    //               .replace(/\]/g, '_r_')
    //               .replace(/\(/g, '_p_')
    //               .replace(/\)/g, '_q_')
    //               .replace(/#/g, '_h_')
    //               .replace(/\//g, '-div-')
    //               .replace(/\./g, '-dot-')
    //             source.replace(startPos, endPos, newClassName)
    //           }
    //           // @ts-ignore
    //           compilation.updateAsset(file, source)
    //         }
    //       }
    //     }
    //   )
    // })
  }
}
