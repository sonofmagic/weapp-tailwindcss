import { normalizeSiteLocale } from '../src/i18n/locale'

export function getBuildLocale() {
  // eslint-disable-next-line node/prefer-global/process -- Docusaurus 会在服务端和客户端构建中注入该环境变量
  return normalizeSiteLocale(process.env.DOCUSAURUS_CURRENT_LOCALE)
}
