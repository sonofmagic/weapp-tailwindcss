import optimizer from './optimize'
import type { Compiler, compilation } from 'webpack4'
import type { IManglePluginOptions } from '@/types'
import { ManglePluginHooks, WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks } from '@/constants'
export class ManglePluginV4 {
  public opts: IManglePluginOptions
  constructor(opts: IManglePluginOptions = {}) {
    this.opts = opts
  }

  apply(compiler: Compiler) {
    // @ts-ignore
    compiler.hooks.compilation.tap(ManglePluginHooks, (compilation) => {
      const optimize = optimizer(compiler, compilation, this.opts)
      // @ts-ignore
      compilation.hooks.optimizeChunkAssets.tap(WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks, (chunks: compilation.Chunk[]) => {
        optimize(chunks)
      })
    })
  }
}
