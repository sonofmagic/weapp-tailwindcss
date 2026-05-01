import { describe, expect, it } from 'vitest'
import {
  createNameMatcher,
  createToken,
  getPattern,
  getReplacement,
  shouldTransformClassName,
  transformLiteralText,
} from '@/experimental/shared'
import { replaceWxml } from '@/wxml/shared'

describe('experimental shared helpers', () => {
  it('creates token records and name matchers', () => {
    expect(createToken(1, 4, 'foo')).toEqual({ start: 1, end: 4, value: 'foo' })

    const exact = createNameMatcher(['className', /^hover/u])
    expect(exact('className')).toBe(true)
    expect(exact('hoverClass')).toBe(true)
    expect(exact('myClassName')).toBe(false)

    const partial = createNameMatcher(['class'], false)
    expect(partial('hoverClassName')).toBe(false)
    expect(partial('className')).toBe(true)

    expect(createNameMatcher(undefined)('className')).toBe(false)
  })

  it('caches regex patterns and replacements per escape map', () => {
    expect(getPattern('text-[#123456]')).toBe(getPattern('text-[#123456]'))
    expect(getReplacement('text-[#123456]')).toBe(replaceWxml('text-[#123456]'))

    const escapeMap = {
      '#': '__hash__',
    }
    expect(getReplacement('text-[#123456]', escapeMap)).toBe('text-_b__hash__123456_B')
    expect(getReplacement('text-[#123456]', escapeMap)).toBe(getReplacement('text-[#123456]', escapeMap))
  })

  it('keeps JS transform decisions bound to classNameSet unless alwaysEscape is enabled', () => {
    expect(shouldTransformClassName('text-[#123456]', {
      classNameSet: new Set(['text-[#123456]']),
    })).toBe(true)
    expect(shouldTransformClassName('text-[#654321]', {
      classNameSet: new Set(['text-[#123456]']),
    })).toBe(false)
    expect(shouldTransformClassName('text-[#654321]', {
      alwaysEscape: true,
      classNameSet: new Set(['text-[#123456]']),
    })).toBe(true)
  })

  it('transforms literal text only when candidates are allowed', () => {
    expect(transformLiteralText('text-[#123456]', {
      classNameSet: new Set(),
    })).toBeUndefined()

    expect(transformLiteralText('text-[#123456]', {
      classNameSet: new Set(['text-[#123456]']),
    })).toBe('text-_b_h123456_B')

    expect(transformLiteralText('noop', {
      alwaysEscape: true,
      classNameSet: new Set(['text-[#123456]']),
    })).toBeUndefined()

    expect(transformLiteralText('text-\\u005b#123456\\u005d', {
      unescapeUnicode: true,
      classNameSet: new Set(['text-[#123456]']),
    })).toBe('text-_b_h123456_B')

    expect(transformLiteralText('text-[#123456] bg-[#654321]', {
      classNameSet: new Set(['text-[#123456]', 'bg-[#654321]']),
    })).toBe('text-_b_h123456_B bg-_b_h654321_B')
  })
})
