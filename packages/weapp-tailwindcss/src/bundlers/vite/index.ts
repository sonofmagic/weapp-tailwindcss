import type { WeappTailwindcssVitePlugin } from './shared/create-framework-plugins'
import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import { getCompilerContext } from '@/context'
import { resolveBundlerAppBranch } from '../branches'
import { createGenericVitePlugins } from './frameworks/generic'
import { createTaroVitePlugins } from './frameworks/taro'
import { createUniAppVitePlugins } from './frameworks/uni-app'
import { createUniAppXVitePlugins } from './frameworks/uni-app-x'
import { createWeappVitePlugins } from './frameworks/weapp-vite'

export type { WeappTailwindcssVitePlugin } from './shared/create-framework-plugins'

/**
 * @name WeappTailwindcss
 * @description Vite 入口只负责早期识别框架分支，具体插件组合由各 framework 目录拥有。
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function WeappTailwindcss(options: UserDefinedOptions = {}): WeappTailwindcssVitePlugin[] | undefined {
  const hasExplicitAppType = typeof options.appType === 'string' && options.appType.trim().length > 0
  const hasExplicitTailwindcssBasedir = typeof options.tailwindcssBasedir === 'string'
    && options.tailwindcssBasedir.trim().length > 0
  const opts = getCompilerContext({
    ...options,
    __internalDeferMissingCssEntriesWarning: true,
  } as UserDefinedOptions)
  ;(opts as any).__internalViteRawOptions = options
  ;(opts as any).__internalViteRawExplicitAppType = hasExplicitAppType
  ;(opts as any).__internalViteRawExplicitTailwindcssBasedir = hasExplicitTailwindcssBasedir
  const branch = resolveBundlerAppBranch({
    appType: opts.appType,
    bundler: 'vite',
    detectEnv: true,
    env: process.env,
    root: opts.tailwindcssBasedir ?? process.cwd(),
    uniAppX: opts.uniAppX,
  })

  switch (branch.branch) {
    case 'taro-vite':
      return createTaroVitePlugins(opts)
    case 'uni-app-vite':
      return createUniAppVitePlugins(opts)
    case 'uni-app-x-vite':
      return createUniAppXVitePlugins(opts)
    case 'weapp-vite':
      return createWeappVitePlugins(opts)
    case 'generic-vite':
    default:
      return createGenericVitePlugins(opts)
  }
}
