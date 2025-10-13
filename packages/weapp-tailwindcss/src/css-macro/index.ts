import plugin from 'tailwindcss/plugin'
import { defu } from '../utils'
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

const cssMacro = plugin.withOptions((options?: Options) => {
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

export default cssMacro
