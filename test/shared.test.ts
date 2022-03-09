import { getOptions } from '@/shared'
import { defaultOptions } from '@/defaults'
describe('shared', () => {
  it('defaultOptions', () => {
    const config = getOptions(null)
    expect(config).toStrictEqual(defaultOptions)
  })

  it('cssPreflight null', () => {
    const config = getOptions({
      cssPreflight: null
    })
    expect(config).toStrictEqual(defaultOptions)
  })

  it('cssPreflight false', () => {
    const config = getOptions({
      cssPreflight: false
    })
    expect(config.cssPreflight).toBe(false)
  })

  it('cssPreflight partial', () => {
    const cssPreflight = {
      'border-color': false,
      'box-sizing': 'content-box',
      'border-style': 0
    }
    const config = getOptions({
      cssPreflight
    })
    expect(config.cssPreflight).toStrictEqual({
      'border-color': false,
      'border-style': 0,
      'border-width': '0',
      'box-sizing': 'content-box'
    })
  })
})
