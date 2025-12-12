import type { Declaration } from 'postcss'

const LENGTH_VALUE_REGEXP = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?rpx$/i

// 修复 tailwindcss 各版本在 JIT 下将 rpx 解析为颜色的情况，返回是否发生变更
export function normalizeTailwindcssRpxDeclaration(
  decl: Declaration,
  options?: { majorVersion?: number },
): boolean {
  const majorVersion = options?.majorVersion
  const normalizedValue = decl.value.trim()

  if (
    LENGTH_VALUE_REGEXP.test(normalizedValue)
    && (majorVersion === undefined || majorVersion === 2 || majorVersion === 3 || majorVersion === 4)
  ) {
    const lowerProp = decl.prop.toLowerCase()
    if (lowerProp === 'color') {
      decl.prop = 'font-size'
      return true
    }
    if (lowerProp === 'background-color') {
      decl.prop = 'background-size'
      return true
    }
    if (lowerProp === 'outline-color') {
      decl.prop = 'outline-width'
      return true
    }
    if (lowerProp.startsWith('border') && lowerProp.endsWith('color')) {
      decl.prop = `${decl.prop.slice(0, -'color'.length)}width`
      return true
    }
    if (lowerProp === '--tw-ring-color') {
      decl.prop = '--tw-ring-offset-width'
      return true
    }
  }

  return false
}
