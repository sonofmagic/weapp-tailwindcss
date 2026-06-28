import { describe, expect, it } from 'vitest'
import {
  createConditionalAtRule,
  createNegativeConditionalAtRule,
  ifdef,
  ifndef,
  matchCustomPropertyFromValue,
  normalComment,
  parseConditionalAtRuleParam,
} from '@/css-macro/constants'
import {
  CSS_MACRO_PLUGIN_MARKER,
  hasCssMacroTailwindPlugin,
  isCssMacroTailwindPlugin,
  markCssMacroPlugin,
} from '@/css-macro/auto'

describe('css macro helpers', () => {
  it('marks css macro plugins without exposing the marker', () => {
    const plugin = markCssMacroPlugin({})

    expect(isCssMacroTailwindPlugin(plugin)).toBe(true)
    expect(Object.keys(plugin)).not.toContain(CSS_MACRO_PLUGIN_MARKER)
    expect(hasCssMacroTailwindPlugin([{}, plugin])).toBe(true)
    expect(hasCssMacroTailwindPlugin({ plugin })).toBe(true)
    expect(hasCssMacroTailwindPlugin(undefined)).toBe(false)
    expect(hasCssMacroTailwindPlugin('plugin')).toBe(false)
    expect(isCssMacroTailwindPlugin({ [CSS_MACRO_PLUGIN_MARKER]: false })).toBe(false)
  })

  it('formats and parses conditional comment helpers', () => {
    expect(createConditionalAtRule('H5"APP')).toBe('@weapp-tw-ifdef "H5\\"APP"{&}')
    expect(createNegativeConditionalAtRule('MP\\WEIXIN')).toBe('@weapp-tw-ifndef "MP\\\\WEIXIN"{&}')
    expect(normalComment('H5_||_MP-WEIXIN')).toBe('H5 || MP-WEIXIN')
    expect(normalComment('H5\\_||\\_MP-WEIXIN')).toBe('H5\\_||\\_MP-WEIXIN')
    expect(ifdef('H5')).toEqual({ start: '#ifdef H5', end: '#endif' })
    expect(ifndef('MP-WEIXIN')).toEqual({ start: '#ifndef MP-WEIXIN', end: '#endif' })
    expect(parseConditionalAtRuleParam('"H5\\\"APP" trailing')).toBe('H5"APP')
    expect(parseConditionalAtRuleParam('H5 || APP')).toBe('H5 || APP')
  })

  it('matches custom platform query values from css conditions', () => {
    const matches: Array<[string | undefined, number]> = []

    matchCustomPropertyFromValue(
      '(weapp-tw-platform:"H5") and (weapp-tw-platform:"MP-WEIXIN")',
      (match, index) => matches.push([match[1], index]),
    )

    expect(matches).toEqual([
      ['H5', 0],
      ['MP-WEIXIN', 1],
    ])
  })
})
