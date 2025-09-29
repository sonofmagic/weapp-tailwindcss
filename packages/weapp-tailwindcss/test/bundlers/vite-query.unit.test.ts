import { describe, expect, it } from 'vitest'

describe('parseVueRequest', () => {
  it('parses vue query parameters and normalises booleans', async () => {
    const { parseVueRequest } = await import('@/bundlers/vite/query')

    const result = parseVueRequest('App.vue?vue&type=style&index=2&lang=ts&raw=1&url=1&scoped=1')

    expect(result.filename).toBe('App.vue')
    expect(result.query).toEqual({
      vue: true,
      type: 'style',
      index: 2,
      lang: 'ts',
      raw: true,
      url: true,
      scoped: true,
    })
  })
})
