import { md5Hash } from '@/cache/md5'
import md5 from 'md5'

describe('md5', () => {
  it('two', () => {
    const testCase = '123'
    const res0 = md5Hash(testCase)
    const res1 = md5(testCase)
    expect(res0).toBe(res1)
  })
})
