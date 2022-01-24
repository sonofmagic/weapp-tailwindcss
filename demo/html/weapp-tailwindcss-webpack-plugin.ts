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
        for (let i = 0; i < entries.length; i++) {
          const [filepath, originalSource] = entries[i]
          console.log(filepath, originalSource)
          const rawSource = originalSource.source()
          // console.log(rawSource)
          const { ReplaceSource } = compiler.webpack.sources
          const extractions = defaultExtractor(rawSource as string)
          const source = new ReplaceSource(originalSource)
          if (extractions.length) {

          }
          // compilation.updateAsset()
        }
      })
    })
  }
}

// defaultExtractor: (content: string): ExtractorResult =>
//     content.match(/[A-Za-z0-9_-]+/g) || [],
