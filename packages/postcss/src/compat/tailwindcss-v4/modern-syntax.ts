import type { AtRule, Declaration } from 'postcss'
import { COLOR_GAMUT_P3_RE, DISPLAY_P3_COLOR_RE, DISPLAY_P3_VALUE_RE, LINEAR_GRADIENT_LAB_RE, MODERN_CHECK_COLOR_RGB_RE, MODERN_CHECK_MARGIN_TRIM_RE, MODERN_CHECK_MOZ_ORIENT_RE, MODERN_CHECK_WEBKIT_HYPHENS_RE } from './variables'

// Tailwind v4 的现代检查语句需要特殊处理以恢复具体规则
export function isTailwindcssV4ModernCheck(atRule: AtRule) {
  return atRule.name === 'supports' && [
    MODERN_CHECK_WEBKIT_HYPHENS_RE,
    MODERN_CHECK_MARGIN_TRIM_RE,
    MODERN_CHECK_MOZ_ORIENT_RE,
    MODERN_CHECK_COLOR_RGB_RE,
  ].every(regex => regex.test(atRule.params))
}

// Tailwind v4 的 lab 渐变能力检测在小程序中没有收益，保留基础声明即可
export function isTailwindcssV4LinearGradientSupports(atRule: AtRule) {
  return atRule.name === 'supports' && LINEAR_GRADIENT_LAB_RE.test(atRule.params)
}

// Tailwind v4 的 display-p3 变量分支是浏览器增强，小程序生成产物保留普通 fallback 即可
export function isTailwindcssV4DisplayP3Supports(atRule: AtRule) {
  return atRule.name === 'supports' && DISPLAY_P3_COLOR_RE.test(atRule.params)
}

// 小程序不支持 display-p3 媒体增强分支，保留普通 rgb fallback 即可
export function isTailwindcssV4DisplayP3Media(atRule: AtRule) {
  return atRule.name === 'media' && COLOR_GAMUT_P3_RE.test(atRule.params)
}

// 小程序不支持 display-p3 颜色函数，删除对应声明以回退到前面的 rgb/var 声明
export function isTailwindcssV4DisplayP3Declaration(decl: Declaration) {
  return DISPLAY_P3_VALUE_RE.test(decl.value)
}
