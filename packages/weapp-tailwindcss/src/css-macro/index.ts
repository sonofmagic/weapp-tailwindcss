import 'tailwindcss/types/config'
import plugin from 'tailwindcss/plugin'
import { createMediaQuery, createNegativeMediaQuery } from './constants'
import { defu } from '@/utils'

export interface Options {
  variantsMap?: Record<string, string | { value: string, negative?: boolean }>
  dynamic?: boolean
}

export default plugin.withOptions((options: Options) => {
  const { dynamic: dynamicMode, variantsMap } = defu<Required<Options>, Options[]>(options, {
    dynamic: true,
    variantsMap: {},
  })
  return ({ matchVariant, addVariant }) => {
    if (dynamicMode) {
      matchVariant('ifdef', (value) => {
        return createMediaQuery(value)
      })
      matchVariant('ifndef', (value) => {
        return createNegativeMediaQuery(value)
      })
    }

    for (const [name, obj] of Object.entries(variantsMap)) {
      if (typeof obj === 'string') {
        addVariant(name, createMediaQuery(obj))
      }
      else {
        addVariant(name, obj.negative ? createNegativeMediaQuery(obj.value) : createMediaQuery(obj.value))
      }
    }
  }
})
