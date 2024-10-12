import plugin from 'tailwindcss/plugin'
import { defu } from '../utils'
import { createMediaQuery, createNegativeMediaQuery } from './constants'

export interface Options {
  variantsMap?: Record<string, string | { value: string, negative?: boolean }>
  dynamic?: boolean
}

const cssMacro = plugin.withOptions((options: Options) => {
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

export default cssMacro
