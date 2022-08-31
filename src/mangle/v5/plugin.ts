import optimizer from './optimize'
import type { Compiler } from 'webpack'
import type { IMangleOptions } from '@/types'

export class ManglePluginV5 {
  public opts: IMangleOptions
  constructor (opts: IMangleOptions = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap('ManglePluginHooks', (compilation) => {
      const optimize = optimizer(compiler, compilation, this.opts)
      compilation.hooks.processAssets.tap('WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks', (chunks) => {
        optimize(chunks)
      })
    })
  }
}
