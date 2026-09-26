import process from 'node:process'

/** 预检与临时 IDE 项目共用授权 AppID，避免游客项目在自动化启动时被拒绝。 */
export function resolveWechatAppId(env: NodeJS.ProcessEnv = process.env) {
  const appId = env.E2E_PREFLIGHT_WECHAT_APPID ?? 'wx6ffee4673b257014'
  if (!/^wx[\da-f]{16}$/i.test(appId)) {
    throw new Error('E2E_PREFLIGHT_WECHAT_APPID 必须是有效的小程序 AppID，不能使用游客项目。')
  }
  return appId
}
