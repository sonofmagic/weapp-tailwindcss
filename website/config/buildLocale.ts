import { normalizeSiteLocale } from '../src/i18n/locale'

export function getBuildLocale() {
  // eslint-disable-next-line node/prefer-global/process -- 此模块也会进入浏览器 bundle，需安全访问可选的 Node 全局
  return normalizeSiteLocale(globalThis.process?.env.DOCUSAURUS_CURRENT_LOCALE)
}
