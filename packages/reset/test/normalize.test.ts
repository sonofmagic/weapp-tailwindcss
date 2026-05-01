import { describe, expect, it } from 'vitest'
import { createResetRule } from '../src/normalize'

describe('createResetRule', () => {
  const defaults = {
    selectors: ['button', '.btn', '#submit'],
    declarations: {
      padding: '0',
      borderWidth: '0',
      lineHeight: 'inherit',
    },
    pseudo: {
      border: 'none',
      background: 'transparent',
    },
  }

  it('returns undefined when the reset is disabled', () => {
    expect(createResetRule(false, defaults)).toBeUndefined()
  })

  it('normalizes default selectors and converts class/id selectors for base rules', () => {
    expect(createResetRule(undefined, defaults)).toEqual({
      selectors: ['button', '[class~="btn"]', '[id="submit"]'],
      declarations: defaults.declarations,
      pseudo: defaults.pseudo,
    })
  })

  it('trims selectors, removes duplicates, and drops whitespace-only custom selectors', () => {
    expect(createResetRule({
      selectors: ['  .item  ', '.item', ' ', '#hero'],
    }, defaults)?.selectors).toEqual(['[class~="item"]', '[id="hero"]'])

    expect(createResetRule({
      selectors: [' ', '\t'],
    }, defaults)).toBeUndefined()
  })

  it('keeps dot and hash selectors unchanged when no selector name is present', () => {
    expect(createResetRule({
      selectors: ['.', '#'],
    }, defaults)?.selectors).toEqual(['.', '#'])
  })

  it('merges declaration overrides and removes disabled declaration values', () => {
    expect(createResetRule({
      declarations: {
        padding: 2,
        borderWidth: false,
        lineHeight: null,
        color: 'inherit',
        display: undefined,
      },
    }, defaults)?.declarations).toEqual({
      padding: '2',
      color: 'inherit',
    })
  })

  it('returns undefined when all declarations are removed', () => {
    expect(createResetRule({
      declarations: {
        padding: false,
        borderWidth: null,
        lineHeight: undefined,
      },
    }, defaults)).toBeUndefined()
  })

  it('normalizes pseudo declarations and omits empty pseudo output', () => {
    expect(createResetRule({
      pseudo: {
        border: false,
        background: null,
        color: 1,
      },
    }, defaults)?.pseudo).toEqual({
      color: '1',
    })

    expect(createResetRule({
      pseudo: {
        border: false,
        background: undefined,
      },
    }, defaults)?.pseudo).toBeUndefined()

    expect(createResetRule(undefined, {
      selectors: ['view'],
      declarations: {
        display: 'block',
      },
    })?.pseudo).toBeUndefined()
  })
})
