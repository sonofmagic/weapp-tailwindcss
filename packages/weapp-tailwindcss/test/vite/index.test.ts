import { parseVueRequest } from '@/bundlers/vite/query'

describe('parseVueRequest', () => {
  it('case 0', () => {
    const { filename, query } = parseVueRequest('App.uvue?vue&type=style&index=0&inline&lang.css')
    expect(filename).toBe('App.uvue')
    expect(query).toEqual({
      'vue': true,
      'type': 'style',
      'index': 0,
      'inline': '',
      'lang.css': '',
    })
  })
})
