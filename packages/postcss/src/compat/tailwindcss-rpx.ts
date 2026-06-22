import type { Declaration, Root } from 'postcss'
import valueParser from 'postcss-value-parser'

const LENGTH_VALUE_REGEXP = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?rpx$/i
const RPX_DIMENSION_REGEXP = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)rpx$/i
const DEFAULT_RPX_TO_REM_ROOT_VALUE = 32
const DEFAULT_RPX_TO_REM_UNIT_PRECISION = 5

export interface TailwindcssRpxToRemOptions {
  rootValue?: number
  unitPrecision?: number
}

function formatRpxToRemValue(value: number, precision: number) {
  const fixed = Number(value.toFixed(precision))
  return Object.is(fixed, -0) ? 0 : fixed
}

export function convertTailwindcssRpxValueToRem(
  value: string,
  options?: TailwindcssRpxToRemOptions,
) {
  if (!value.includes('rpx') && !value.includes('RPX')) {
    return value
  }

  let changed = false
  const rootValue = options?.rootValue ?? DEFAULT_RPX_TO_REM_ROOT_VALUE
  const unitPrecision = options?.unitPrecision ?? DEFAULT_RPX_TO_REM_UNIT_PRECISION
  const parsed = valueParser(value)

  parsed.walk((node) => {
    if (node.type !== 'word') {
      return
    }

    const match = RPX_DIMENSION_REGEXP.exec(node.value)
    if (!match) {
      return
    }

    node.value = `${formatRpxToRemValue(Number(match[1]) / rootValue, unitPrecision)}rem`
    changed = true
  })

  return changed ? parsed.toString() : value
}

// 修复 Tailwind CSS 在 JIT 下将 rpx 解析为颜色的情况，返回是否发生变更
export function normalizeTailwindcssRpxDeclaration(
  decl: Declaration,
  options?: { majorVersion?: 4 },
): boolean {
  const majorVersion = options?.majorVersion
  const normalizedValue = decl.value.trim()

  if (
    LENGTH_VALUE_REGEXP.test(normalizedValue)
    && (majorVersion === undefined || majorVersion === 4)
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

export function normalizeTailwindcssRpxDeclarations(
  root: Root,
  options?: { majorVersion?: 4 },
) {
  let changed = false
  root.walkDecls((decl) => {
    changed = normalizeTailwindcssRpxDeclaration(decl, options) || changed
  })
  return changed
}

export function convertTailwindcssRpxDeclarationToRem(
  decl: Declaration,
  options?: TailwindcssRpxToRemOptions,
) {
  const value = convertTailwindcssRpxValueToRem(decl.value, options)
  if (value === decl.value) {
    return false
  }
  decl.value = value
  return true
}

export function convertTailwindcssRpxDeclarationsToRem(
  root: Root,
  options?: TailwindcssRpxToRemOptions,
) {
  let changed = false
  root.walkDecls((decl) => {
    changed = convertTailwindcssRpxDeclarationToRem(decl, options) || changed
  })
  return changed
}

export function normalizeTailwindcssWebRpxDeclarations(
  root: Root,
  options?: { majorVersion?: 4 } & TailwindcssRpxToRemOptions,
) {
  const normalized = normalizeTailwindcssRpxDeclarations(root, options)
  const converted = convertTailwindcssRpxDeclarationsToRem(root, options)
  return normalized || converted
}
