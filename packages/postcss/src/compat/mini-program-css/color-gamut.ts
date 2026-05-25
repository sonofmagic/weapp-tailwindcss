import type postcss from 'postcss'

const DISPLAY_P3_VALUE_RE = /color\(\s*display-p3\b/i
const COLOR_GAMUT_P3_RE = /\(\s*color-gamut\s*:\s*p3\s*\)/i

export function isDisplayP3MediaRule(atRule: postcss.AtRule) {
  return atRule.name === 'media' && COLOR_GAMUT_P3_RE.test(atRule.params)
}

export function isDisplayP3Declaration(decl: postcss.Declaration) {
  return DISPLAY_P3_VALUE_RE.test(decl.value)
}
