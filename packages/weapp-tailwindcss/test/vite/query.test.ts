import { parseVueRequest } from '@/bundlers/vite/query'

describe('parseVueRequest', () => {
  it('parses vue block queries with flags', () => {
    const { filename, query } = parseVueRequest('Component.vue?vue&type=style&index=0&lang=css&scoped=1')

    expect(filename).toBe('Component.vue')
    expect(query).toEqual({
      vue: true,
      type: 'style',
      index: 0,
      lang: 'css',
      scoped: true,
    })
  })

  it('handles plain filenames without query', () => {
    const { filename, query } = parseVueRequest('App.vue')

    expect(filename).toBe('App.vue')
    expect(query).toEqual({})
  })
})
