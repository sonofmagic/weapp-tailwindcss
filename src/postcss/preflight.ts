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

// export const getViewElementPreflight: InjectPreflight = () => {
//   const decl1 = new Declaration({
//     prop: 'box-sizing',
//     value: 'border-box'
//   })
//   const decl2 = new Declaration({
//     prop: 'border-width',
//     value: '0'
//   })
//   const decl3 = new Declaration({
//     prop: 'border-style',
//     value: 'solid'
//   })
//   const decl4 = new Declaration({
//     prop: 'border-color',
//     value: 'currentColor'
//   })
//   return [decl1, decl2, decl3, decl4]
// }
