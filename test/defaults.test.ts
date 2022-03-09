import { defaultOptions } from '@/defaults'
const { mainCssChunkMatcher } = defaultOptions

describe('defaults function test group', () => {
  test('mainCssChunkMatcher', async () => {
    const case1 = 'dsd/sdsd.wxss'

    const uniappWxss = 'common/main.wxss'

    const taroWxss = 'app.wxss'
    expect(mainCssChunkMatcher(case1, undefined)).toBe(true)

    expect(mainCssChunkMatcher(case1, 'taro')).toBe(false)

    expect(mainCssChunkMatcher(case1, 'uni-app')).toBe(false)

    expect(mainCssChunkMatcher(uniappWxss, 'uni-app')).toBe(true)

    expect(mainCssChunkMatcher(taroWxss, 'taro')).toBe(true)
  })
})
