import type { Plugin } from 'vite'
import type { ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import process from 'node:process'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

const taroCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  shouldKeepRootMiniProgramStyleAsImportShell() {
    return true
  },
  shouldMoveRootMiniProgramStyleToImportShellOrigin() {
    return true
  },
  shouldNormalizeRootMiniProgramImportShell() {
    return true
  },
}

function createTaroAlipayBrowserslistAssetPlugin(): Plugin {
  return {
    name: 'weapp-tailwindcss:taro-alipay-browserslist-asset',
    enforce: 'pre',
    generateBundle(_options, bundle) {
      if (process.env.TARO_ENV !== 'alipay') {
        return
      }
      // Taro Alipay 插件会在 modifyBuildAssets 中写入该文件；Vite runner 需要它先存在于 bundle 图中。
      bundle['.browserslistrc'] = {
        type: 'asset',
        fileName: '.browserslistrc',
        source: 'defaults and fully supports es6-module',
      }
    },
  }
}

export function createTaroVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return [
    createTaroAlipayBrowserslistAssetPlugin(),
    ...createViteFrameworkPlugins(options, {
      frameworkName: 'taro',
      cssPipelineStrategy: taroCssPipelineStrategy,
      styleInjectorDelegate: viteStyleInjectorDelegates.taro,
    }),
  ]
}
