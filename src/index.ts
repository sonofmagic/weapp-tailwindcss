import type { Compiler } from 'webpack'
// import { sources } from 'webpack'

// const pluginName = 'weapp-tailwindcss-webpack-plugin'

export class WeappTailwindcssWebpackPlugin {
  apply (compiler: Compiler) {
    console.log(compiler)
  }
}
