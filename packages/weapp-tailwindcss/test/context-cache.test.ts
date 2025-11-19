import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'

describe('compiler context cache', () => {
  it('reuses context for identical option values', () => {
    const ctxA = getCompilerContext({
      cssEntries: ['src/app.weapp.css'],
      cssChildCombinatorReplaceValue: ['view', 'text'],
    })
    const ctxB = getCompilerContext({
      cssChildCombinatorReplaceValue: ['view', 'text'],
      cssEntries: ['src/app.weapp.css'],
    })

    expect(ctxA).toBe(ctxB)
    expect(ctxA.twPatcher).toBe(ctxB.twPatcher)
  })

  it('creates new context when options differ', () => {
    const ctxA = getCompilerContext({
      cssEntries: ['src/app.weapp.css'],
    })
    const ctxB = getCompilerContext({
      cssEntries: ['src/native.weapp.css'],
    })

    expect(ctxA).not.toBe(ctxB)
  })

  it('normalizes maps and regex when building cache keys', () => {
    const ctxA = getCompilerContext({
      customAttributes: new Map<string | RegExp, (string | RegExp)[]>([
        ['view', [/^foo$/, 'bar']],
      ]),
    })
    const ctxB = getCompilerContext({
      customAttributes: new Map<string | RegExp, (string | RegExp)[]>([
        ['view', [/^foo$/, 'bar']],
      ]),
    })

    expect(ctxA).toBe(ctxB)
  })
})
