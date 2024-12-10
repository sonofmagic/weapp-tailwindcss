import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from './types'
import { getOptions } from './options'

/**
 * 创建一个上下文对象，用于处理小程序的模板、样式和脚本转换。
 * @param options - 用户定义的选项对象
 * @returns 返回一个包含 transformWxss、transformWxml 和 transformJs 方法的对象
 */
export function createContext(options: UserDefinedOptions = {}) {
  const opts = getOptions(options)
  const { templateHandler, styleHandler, patch, jsHandler, twPatcher } = opts

  let runtimeSet = new Set<string>()
  patch?.()

  function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    return styleHandler(rawCss, Object.assign({
      isMainChunk: true,
    }, options))
  }

  function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } & CreateJsHandlerOptions = {}) {
    runtimeSet
      = options && options.runtimeSet
        ? options.runtimeSet
        : twPatcher.getClassSet()

    return jsHandler(rawJs, runtimeSet, options)
  }

  function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
    return templateHandler(rawWxml, Object.assign({
      runtimeSet,
    }, options))
  }

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
