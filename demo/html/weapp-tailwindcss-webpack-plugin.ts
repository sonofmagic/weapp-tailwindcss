import type { UserDefinedOptions } from './types'
import type { Compiler, Compilation } from 'webpack'
import { defaultExtractor } from './defaultExtractor'
// const styleExtensions = ['.css', '.scss', '.styl', '.sass', '.less']

const pluginName = 'weapp-tailwindcss-webpack-plugin'
export class WeappTailwindcssWebpackPlugin {
  opts: UserDefinedOptions
  constructor (opts = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(pluginName, async (assets) => {
        const entries = Object.entries(assets)
        const { ReplaceSource } = compiler.webpack.sources
        for (let i = 0; i < entries.length; i++) {
          const [file, originalSource] = entries[i]
          // console.log(filepath, originalSource)
          const rawSource = originalSource.source().toString()
          const regex = /class="(.+)"/g

          let match
          const source = new ReplaceSource(originalSource)
          while ((match = regex.exec(rawSource))) {
            const original = match[1] as string
            const startPos = match.index + match[0].indexOf(original)
            const endPos = startPos + original.length - 1
            const newClassName = original
              .replace(/\[/g, '_l_')
              .replace(/\]/g, '_r_')
              .replace(/\//g, '-div-')
              .replace(/\./g, '-dot-')
            source.replace(startPos, endPos, newClassName)
          }
          compilation.updateAsset(file, source)
        }
      })
    })
  }
}

// defaultExtractor: (content: string): ExtractorResult =>
//     content.match(/[A-Za-z0-9_-]+/g) || [],
