import type { Compiler, Compilation } from 'webpack'
import type { UserDefinedOptions } from './types'
// import { sources } from 'webpack'

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
          console.log(rawSource)
        }
      })
    })
  }
}
