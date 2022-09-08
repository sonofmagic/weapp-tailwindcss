import type { CssPreflightOptions, IPropValue } from '@/types'

export type InjectPreflight = () => IPropValue[]

export const createInjectPreflight = (options: CssPreflightOptions): InjectPreflight => {
  const result: IPropValue[] = []
  // if options false ,do no thing
  if (options && typeof options === 'object') {
    const entries = Object.entries(options)
    for (let i = 0; i < entries.length; i++) {
      const [prop, value] = entries[i]
      if (value !== false) {
        result.push({
          prop,
          value: value.toString()
        })
      }
    }
  }

  return () => {
    return result
  }
}
