import type { CssPreflightOptions } from '../types'
import type { IPropValue } from '../types/postcss'

export type InjectPreflight = () => IPropValue[]

export function createInjectPreflight(options?: CssPreflightOptions): InjectPreflight {
  const result: IPropValue[] = []
  // if options false ,do no thing
  if (options && typeof options === 'object') {
    const entries = Object.entries(options)
    for (const [prop, value] of entries) {
      if (value !== false) {
        result.push({
          prop,
          value: value.toString(),
        })
      }
    }
  }

  return () => {
    return result
  }
}
