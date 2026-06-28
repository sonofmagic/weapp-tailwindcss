import { describe, expect, it } from 'vitest'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveUnocssBareArbitraryValues } from '@/unocss'
import { escapeStringRegexp } from '@/utils/regex'

describe('small helper modules', () => {
  it('resolves unocss bare arbitrary value defaults conservatively', () => {
    expect(resolveUnocssBareArbitraryValues(undefined, false)).toEqual({})
    expect(resolveUnocssBareArbitraryValues({ bareArbitraryValues: ['length'] } as any, true))
      .toEqual({ bareArbitraryValues: ['length'] })
    expect(resolveUnocssBareArbitraryValues({}, true)).toEqual({ bareArbitraryValues: true })
    expect(resolveUnocssBareArbitraryValues({}, { bareArbitraryValues: false } as any)).toEqual({})
    expect(resolveUnocssBareArbitraryValues({}, { bareArbitraryValues: ['color'] } as any))
      .toEqual({ bareArbitraryValues: ['color'] })
  })

  it('escapes regexp metacharacters and rejects non-string inputs', () => {
    expect(escapeStringRegexp('a-b$c[0]')).toBe('a\\x2db\\$c\\[0\\]')
    expect(() => escapeStringRegexp(1 as any)).toThrow(TypeError)
  })

  it('keeps generator option exports reachable from the public generator entry', () => {
    expect(normalizeWeappTailwindcssGeneratorOptions({ target: 'web' }).target).toBe('web')
  })
})
