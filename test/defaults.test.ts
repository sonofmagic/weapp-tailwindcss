import { defaultOptions } from '@/defaults'
import { isWebpackPlugin } from './util'
import esm from 'esm'
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

  it('should export', () => {
    const {
      KboneWeappTailwindcssWebpackPluginV4,
      NativeWeappTailwindcssWebpackPluginV5,
      RaxTailwindcssWebpackPluginV5,
      RemaxWeappTailwindcssWebpackPluginV4,
      TaroWeappTailwindcssWebpackPluginV4,
      UniAppWeappTailwindcssWebpackPluginV4,
      ViteWeappTailwindcssPlugin,
      postcssWeappTailwindcssRename
    } = require('../')

    expect(isWebpackPlugin(KboneWeappTailwindcssWebpackPluginV4)).toBe(true)
    expect(isWebpackPlugin(NativeWeappTailwindcssWebpackPluginV5)).toBe(true)
    expect(isWebpackPlugin(RaxTailwindcssWebpackPluginV5)).toBe(true)
    expect(isWebpackPlugin(RemaxWeappTailwindcssWebpackPluginV4)).toBe(true)
    expect(isWebpackPlugin(TaroWeappTailwindcssWebpackPluginV4)).toBe(true)
    expect(isWebpackPlugin(UniAppWeappTailwindcssWebpackPluginV4)).toBe(true)
    expect(Boolean(ViteWeappTailwindcssPlugin)).toBe(true)
    expect(Boolean(postcssWeappTailwindcssRename)).toBe(true)
  })

  it('should replace export', async () => {
    const r = esm(module)
    const { replaceCss, replaceJs } = r('../replace') // await import('../replace')

    expect(replaceCss).toBeTruthy()
    expect(replaceJs).toBeTruthy()
    expect(typeof replaceCss).toBe('function')
    expect(typeof replaceJs).toBe('function')
  })
})
