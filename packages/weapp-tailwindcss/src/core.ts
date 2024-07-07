import { getOptions } from '@/options'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from '@/types'

export function createContext(options: UserDefinedOptions = {}) {
  const opts = getOptions(options)
  const { templateHandler, styleHandler, patch, jsHandler, twPatcher } = opts

  let runtimeSet = new Set<string>()
  patch?.()

  async function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    const code = await styleHandler(rawCss, Object.assign({
      isMainChunk: true,
    }, options))
    return code
  }

  async function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } & CreateJsHandlerOptions = {}) {
    runtimeSet
      = options && options.runtimeSet
        ? options.runtimeSet
        : twPatcher.getClassSet()

    const { code } = await jsHandler(rawJs, runtimeSet, options)
    return code
  }

  function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
    const code = templateHandler(rawWxml, Object.assign({
      runtimeSet,
    }, options))
    return code
  }

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
