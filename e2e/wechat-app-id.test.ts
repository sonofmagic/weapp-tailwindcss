import { expect, it } from 'vitest'
import { resolveWechatAppId } from '../scripts/wechat-app-id'

it('预检与 IDE 沿用仓库授权 AppID，并接受显式环境配置', () => {
  expect(resolveWechatAppId({})).toBe('wx6ffee4673b257014')
  expect(resolveWechatAppId({ E2E_PREFLIGHT_WECHAT_APPID: 'wx0123456789abcdef' })).toBe('wx0123456789abcdef')
})

it.each(['', 'touristappid', 'invalid'])('在启动前拒绝无效的 AppID：%j', (appId) => {
  expect(() => resolveWechatAppId({ E2E_PREFLIGHT_WECHAT_APPID: appId })).toThrow('AppID')
})
