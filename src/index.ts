import type { Compiler, Compilation } from 'webpack'
// import { sources } from 'webpack'

const pluginName = 'weapp-tailwindcss-webpack-plugin'

export class WeappTailwindcssWebpackPlugin {
  apply (compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginName, this.initializePlugin.bind(this))
  }

  initializePlugin (compilation: Compilation): void {
    compilation.hooks.additionalAssets.tapPromise(pluginName, () => {
      return this.runPluginHook(compilation)
    })
  }

  async runPluginHook (compilation: Compilation): Promise<void> {
    console.log(compilation.assets)

    console.log(compilation.chunks)
  }
}
