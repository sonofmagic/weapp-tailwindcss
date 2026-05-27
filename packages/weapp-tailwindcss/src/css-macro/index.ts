import plugin from 'tailwindcss/plugin'
import { defu } from '../utils'
import { markCssMacroPlugin } from './auto'
import { createMediaQuery, createNegativeMediaQuery } from './constants'

export interface Options {
  variantsMap?: Record<string, string | { value: string, negative?: boolean }>
  dynamic?: boolean
}

interface NormalizedVariant {
  name: string
  negative: boolean
  value: string
}

const defaultOptions: Required<Options> = {
  dynamic: true,
  variantsMap: {},
}

const cssMacroFactory = plugin.withOptions((options?: Options) => {
  const { dynamic, variantsMap } = defu<Required<Options>, Options[]>(options ?? {}, defaultOptions)

  const staticVariants: NormalizedVariant[] = Object.entries(variantsMap).map(([name, config]) => {
    if (typeof config === 'string') {
      return {
        name,
        negative: false,
        value: config,
      }
    }
    return {
      name,
      negative: Boolean(config.negative),
      value: config.value,
    }
  })

  return (api) => {
    const { matchVariant, addVariant } = api
    const supportsDynamic = typeof matchVariant === 'function'
    if (dynamic && supportsDynamic) {
      matchVariant('ifdef', value => createMediaQuery(value))
      matchVariant('ifndef', value => createNegativeMediaQuery(value))
    }

    if (typeof addVariant === 'function') {
      for (const variant of staticVariants) {
        const query = variant.negative
          ? createNegativeMediaQuery(variant.value)
          : createMediaQuery(variant.value)
        addVariant(variant.name, query)
      }
    }
  }
})

const cssMacro = markCssMacroPlugin(((options?: Options) => {
  return markCssMacroPlugin(cssMacroFactory(options))
}) as typeof cssMacroFactory)

const cssMacroOptionsFunction = cssMacro as typeof cssMacroFactory & {
  __configFunction?: unknown
  __isOptionsFunction?: boolean
  __pluginFunction?: unknown
}
const cssMacroFactoryOptionsFunction = cssMacroFactory as typeof cssMacroFactory & {
  __configFunction?: unknown
  __isOptionsFunction?: boolean
  __pluginFunction?: unknown
}

cssMacroOptionsFunction.__isOptionsFunction = cssMacroFactoryOptionsFunction.__isOptionsFunction
cssMacroOptionsFunction.__pluginFunction = cssMacroFactoryOptionsFunction.__pluginFunction
cssMacroOptionsFunction.__configFunction = cssMacroFactoryOptionsFunction.__configFunction

export default cssMacro
