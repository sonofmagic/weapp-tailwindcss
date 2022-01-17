import { foo, wait } from '../src'

describe('[Default]', () => {
  test('foo should be bar', () => {
    expect(foo).toBe('bar')
  })

  test('wait 100ms', async () => {
    const flag = await wait(100)
    expect(flag).toBe(true)
  })
})
