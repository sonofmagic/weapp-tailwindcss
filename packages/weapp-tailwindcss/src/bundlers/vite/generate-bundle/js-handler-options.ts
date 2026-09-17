import type { CreateJsHandlerOptions, InternalUserDefinedOptions } from '@/types'
import { isUniAppXEnabled } from '@/uni-app-x/options'

interface JsHandlerOptionsFactoryOptions {
  getExperimentalJsFastPath?: () => CreateJsHandlerOptions['experimentalJsFastPath']
  getMajorVersion: () => number | undefined
  moduleGraph: CreateJsHandlerOptions['moduleGraph']
}

export function resolveUniAppXJsTransformEnabled(uniAppX: InternalUserDefinedOptions['uniAppX'] | undefined) {
  return uniAppX === undefined ? true : isUniAppXEnabled(uniAppX)
}

/**
 * generateBundle 里每个 chunk 都会独立转译。
 * 生产构建再走 moduleGraph 只会把已在产物里的 JS 再 Babel 一遍；增量模式才需要它更新被跳过的 clean chunk。
 */
export function resolveGenerateBundleJsFastPath(options: {
  experimentalJsFastPath?: CreateJsHandlerOptions['experimentalJsFastPath']
  useIncrementalMode: boolean
}) {
  return {
    experimentalJsFastPath: options.experimentalJsFastPath ?? 'oxc',
    moduleGraphEnabled: options.useIncrementalMode,
  }
}

export function createJsHandlerOptionsFactory(options: JsHandlerOptionsFactoryOptions) {
  return (absoluteFilename: string, extra?: CreateJsHandlerOptions): CreateJsHandlerOptions => ({
    ...extra,
    generateMap: false,
    experimentalJsFastPath: options.getExperimentalJsFastPath?.(),
    filename: absoluteFilename,
    tailwindcssMajorVersion: options.getMajorVersion(),
    moduleGraph: options.moduleGraph,
    babelParserOptions: {
      ...(extra?.babelParserOptions ?? {}),
      sourceFilename: absoluteFilename,
    },
  })
}
