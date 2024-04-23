import { getOptions } from '@/options'
import { UserDefinedOptions } from '@/types'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'

export function createContext(options: UserDefinedOptions = {}) {
  const opts = getOptions(options)
  const { templateHandler, styleHandler, patch, jsHandler, tailwindcssBasedir } = opts

  let runtimeSet = new Set<string>()
  patch?.()

  const twPatcher = createTailwindcssPatcher()

  async function transformWxss(rawCss: string) {
    const code = await styleHandler(rawCss, {
      isMainChunk: true
    })
    return code
  }

  async function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } = {}) {
    runtimeSet =
      options && options.runtimeSet
        ? options.runtimeSet
        : twPatcher.getClassSet({
            basedir: tailwindcssBasedir
          })

    const { code } = await jsHandler(rawJs, runtimeSet)
    return code
  }

  function transformWxml(rawWxml: string) {
    const code = templateHandler(rawWxml, {
      runtimeSet
    })
    return code
  }

  return {
    transformWxss,
    transformWxml,
    transformJs
  }
}
