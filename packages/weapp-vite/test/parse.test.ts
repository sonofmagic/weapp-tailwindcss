import { parseRequest } from '@/plugins/parse'

describe('parse', () => {
  it('scss', () => {
    const res = parseRequest('x/y.scss')
    expect(res.query.wxss).toBe(undefined)
  })

  it('wxss', () => {
    const res = parseRequest('x/y.css?wxss')
    expect(res.query.wxss).toBe(true)
  })
})
