import optimizer from './optimize'
import type { Compiler } from 'webpack'
import type { IManglePluginOptions } from '@/types'
import { ManglePluginHooks, WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks } from '@/constants'
export class ManglePluginV5 {
  public opts: IManglePluginOptions
  constructor(opts: IManglePluginOptions = {}) {
    this.opts = opts
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(ManglePluginHooks, (compilation) => {
      const optimize = optimizer(compiler, compilation, this.opts)
      compilation.hooks.processAssets.tap(WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks, (chunks) => {
        optimize(chunks)
      })
    })
  }
}
