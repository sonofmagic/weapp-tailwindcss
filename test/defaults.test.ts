import { defaultOptions } from '@/defaults'
import { isWebpackPlugin } from './util'
import esm from 'esm'
const { mainCssChunkMatcher } = defaultOptions

describe('defaults function test group', () => {
  test('mainCssChunkMatcher', async () => {
    const case1 = 'dsd/sdsd.wxss'

    const uniappWxss = 'common/main.wxss'

    const taroWxss = 'app.wxss'
    if (typeof mainCssChunkMatcher === 'function') {
      expect(mainCssChunkMatcher(case1, undefined)).toBe(true)

      expect(mainCssChunkMatcher(case1, 'taro')).toBe(false)

      expect(mainCssChunkMatcher(case1, 'uni-app')).toBe(false)

      expect(mainCssChunkMatcher(uniappWxss, 'uni-app')).toBe(true)

      expect(mainCssChunkMatcher(taroWxss, 'taro')).toBe(true)
    } else {
      expect(true).toBe(false)
    }
  })

  it('should export', () => {
    const {
      BaseJsxWebpackPluginV4,
      BaseTemplateWebpackPluginV4,
      KboneWeappTailwindcssWebpackPluginV4,
      RemaxWeappTailwindcssWebpackPluginV4,
      TaroWeappTailwindcssWebpackPluginV4,
      UniAppWeappTailwindcssWebpackPluginV4,
      BaseJsxWebpackPluginV5,
      BaseTemplateWebpackPluginV5,
      MpxWeappTailwindcssWebpackPluginV5,
      NativeWeappTailwindcssWebpackPluginV5,
      RaxTailwindcssWebpackPluginV5
    } = require('../')
    const plugins = [
      BaseJsxWebpackPluginV4,
      BaseTemplateWebpackPluginV4,
      KboneWeappTailwindcssWebpackPluginV4,
      RemaxWeappTailwindcssWebpackPluginV4,
      TaroWeappTailwindcssWebpackPluginV4,
      UniAppWeappTailwindcssWebpackPluginV4,
      BaseJsxWebpackPluginV5,
      BaseTemplateWebpackPluginV5,
      MpxWeappTailwindcssWebpackPluginV5,
      NativeWeappTailwindcssWebpackPluginV5,
      RaxTailwindcssWebpackPluginV5
    ]
    plugins.forEach((plugin) => {
      expect(isWebpackPlugin(plugin)).toBe(true)
    })
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
