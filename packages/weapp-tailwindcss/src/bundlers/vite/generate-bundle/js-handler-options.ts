import type { CreateJsHandlerOptions, InternalUserDefinedOptions } from '@/types'
import { isUniAppXEnabled } from '@/uni-app-x/options'

interface JsHandlerOptionsFactoryOptions {
  getMajorVersion: () => number | undefined
  moduleGraph: CreateJsHandlerOptions['moduleGraph']
}

export function resolveUniAppXJsTransformEnabled(uniAppX: InternalUserDefinedOptions['uniAppX'] | undefined) {
  return uniAppX === undefined ? true : isUniAppXEnabled(uniAppX)
}

export function createJsHandlerOptionsFactory(options: JsHandlerOptionsFactoryOptions) {
  return (absoluteFilename: string, extra?: CreateJsHandlerOptions): CreateJsHandlerOptions => ({
    ...extra,
    filename: absoluteFilename,
    tailwindcssMajorVersion: options.getMajorVersion(),
    moduleGraph: options.moduleGraph,
    babelParserOptions: {
      ...(extra?.babelParserOptions ?? {}),
      sourceFilename: absoluteFilename,
    },
  })
}
