import optimizer from './optimize'
import type { Compiler, compilation } from 'webpack4'
import type { IMangleOptions } from '@/types'

export class ManglePluginV4 {
  public opts: IMangleOptions
  constructor (opts: IMangleOptions = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    // @ts-ignore
    compiler.hooks.compilation.tap('ManglePluginHooks', (compilation) => {
      const optimize = optimizer(compiler, compilation, this.opts)
      // @ts-ignore
      compilation.hooks.optimizeChunkAssets.tap('WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks', (chunks: compilation.Chunk[]) => {
        optimize(chunks)
      })
    })
  }
}
