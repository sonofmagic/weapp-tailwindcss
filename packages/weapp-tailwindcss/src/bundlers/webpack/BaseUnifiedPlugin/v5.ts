// webpack 5
import type { Compiler } from 'webpack'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import process from 'node:process'
import { getCompilerContext } from '@/context'
import { resolveBundlerAppBranch } from '../../branches'
import { createWebpackFrameworkPlugin } from '../frameworks'

export { weappTailwindcssPackageDir } from '../shared/create-framework-plugin'

/**
 * @name WeappTailwindcss
 * @description Webpack 入口只负责早期识别框架分支，具体 hook 由 framework 目录下的插件拥有。
 * @link https://tw.icebreaker.top/docs/intro
 */
export class WeappTailwindcss implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getCompilerContext({
      ...options,
      __internalDeferMissingCssEntriesWarning: true,
    } as UserDefinedOptions)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    const branch = resolveBundlerAppBranch({
      appType: this.appType,
      bundler: 'webpack',
      detectEnv: true,
      env: process.env,
      root: compiler.options?.context ?? compiler.context,
      uniAppX: this.options.uniAppX,
    })
    const plugin = createWebpackFrameworkPlugin(branch.branch, this.options)
    plugin.apply(compiler)
    this.options = plugin.options
    this.appType = plugin.appType
  }
}
