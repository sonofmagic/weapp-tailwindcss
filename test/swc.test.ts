import { parse, transform } from '@swc/core'

import { createGetCase, jsCasePath } from './util'

const getCase = createGetCase(jsCasePath)

describe('swc', () => {
  it('parse case 0', async () => {
    const code = await getCase('jsStringEscape.js')
    const res = await parse(code, {
      syntax: 'ecmascript'
    })
    expect(res).toBeDefined()
  })

  it('transform case 0', async () => {
    const code = await getCase('jsStringEscape.js')
    const res = await transform(code, {
      jsc: {
        transform: {}
      }
    })
    expect(res).toBeDefined()
  })
})
