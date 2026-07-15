import type { Declaration } from 'postcss'
import valueParser from 'postcss-value-parser'
import { normalizeTailwindcssV4GradientDirectionDeclaration, normalizeTailwindcssV4GradientPosition, normalizeTailwindcssV4InfinityCalcValue } from './gradients'
import { CLAMP_PX, RADIUS_THRESHOLD, RADIUS_VALUE_RE, SCIENTIFIC_NOTATION_RE, TW_GRADIENT_POSITION_PROPS } from './variables'

function normalizeTailwindcssV4EmptyVarFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }

    const firstArg = node.nodes.find(child => child.type !== 'space')
    const lastArg = node.nodes.findLast(child => child.type !== 'space')
    if (
      firstArg?.type !== 'word'
      || !firstArg.value.startsWith('--tw-')
      || lastArg?.type !== 'div'
      || lastArg.value !== ','
      || node.after === ' '
    ) {
      return
    }

    node.after = ' '
    changed = true
  })

  return changed ? parsed.toString() : value
}

function normalizeTailwindcssV4GradientStopsFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-gradient-via-stops')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  function normalizeNodes(nodes: valueParser.Node[]) {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]
      if (!node) {
        continue
      }
      if (node.type === 'function' && node.value.toLowerCase() !== 'var') {
        normalizeNodes(node.nodes)
        continue
      }
      if (node.type !== 'function') {
        continue
      }

      const args = node.nodes.filter(child => child.type !== 'space')
      const firstArg = args[0]
      if (
        firstArg?.type !== 'word'
        || firstArg.value !== '--tw-gradient-via-stops'
      ) {
        normalizeNodes(node.nodes)
        continue
      }

      const firstCommaIndex = node.nodes.findIndex(child => child.type === 'div' && child.value === ',')
      if (firstCommaIndex < 0) {
        continue
      }

      const fallbackNodes = node.nodes.slice(firstCommaIndex + 1)
      const splitIndex = fallbackNodes.findIndex(child => child.type === 'div' && child.value === ',')
      if (splitIndex < 0) {
        continue
      }

      const viaFallbackNodes = fallbackNodes.slice(0, splitIndex)
      const stopNodes = fallbackNodes.slice(splitIndex)
      const nextVarNode = {
        ...node,
        nodes: [
          { type: 'word', value: '--tw-gradient-via-stops' },
          { type: 'div', value: ',', before: '', after: ' ' },
          ...viaFallbackNodes,
        ],
        sourceEndIndex: undefined,
        sourceIndex: undefined,
      }
      nodes.splice(index, 1, nextVarNode, ...stopNodes)
      changed = true
      index += stopNodes.length
    }
  }

  normalizeNodes(parsed.nodes)

  return changed ? parsed.toString() : value
}

function normalizeTailwindcssV4GradientPositionFallback(value: string) {
  if (!value.includes('var(') || !value.includes('--tw-gradient-')) {
    return value
  }

  const parsed = valueParser(value)
  let changed = false

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'var') {
      return
    }

    const args = node.nodes.filter(child => child.type !== 'space')
    const firstArg = args[0]
    if (
      firstArg?.type !== 'word'
      || !TW_GRADIENT_POSITION_PROPS.has(firstArg.value)
    ) {
      return
    }
    const commaIndex = args.findIndex(child => child.type === 'div' && child.value === ',')
    const comma = commaIndex === -1 ? undefined : args[commaIndex]
    if (comma) {
      const hasFallback = args.slice(commaIndex + 1).some(child => child.type !== 'space')
      if (!hasFallback && node.after !== ' ') {
        node.after = ' '
        changed = true
      }
      return
    }

    node.nodes.push({
      type: 'div',
      value: ',',
      before: '',
      after: '',
    })
    node.after = ' '
    changed = true
  })

  return changed ? parsed.toString() : value
}

// 对 Tailwind v4 生成的声明做兼容处理，返回是否发生变更
export function normalizeTailwindcssV4Declaration(decl: Declaration): boolean {
  let changed = false
  if (decl.prop === '--tw-gradient-via-stops' && decl.value.trim() === 'initial') {
    decl.remove()
    return true
  }
  const normalizedEmptyVarFallback = normalizeTailwindcssV4EmptyVarFallback(decl.value)
  if (normalizedEmptyVarFallback !== decl.value) {
    decl.value = normalizedEmptyVarFallback
    changed = true
  }
  const normalizedGradientStopsFallback = normalizeTailwindcssV4GradientStopsFallback(decl.value)
  if (normalizedGradientStopsFallback !== decl.value) {
    decl.value = normalizedGradientStopsFallback
    changed = true
  }
  const normalizedGradientPositionFallback = normalizeTailwindcssV4GradientPositionFallback(decl.value)
  if (normalizedGradientPositionFallback !== decl.value) {
    decl.value = normalizedGradientPositionFallback
    changed = true
  }

  if (decl.prop === '--tw-gradient-position') {
    const nextValue = decl.parent?.type === 'rule'
      ? normalizeTailwindcssV4GradientDirectionDeclaration(decl.parent, decl)
      : normalizeTailwindcssV4GradientPosition(decl.value)
    if (nextValue !== decl.value) {
      decl.value = nextValue
      return true
    }
  }

  const normalizedInfinityCalcValue = normalizeTailwindcssV4InfinityCalcValue(decl.value)
  if (normalizedInfinityCalcValue !== decl.value) {
    decl.value = normalizedInfinityCalcValue
    return true
  }

  if (decl.prop.includes('radius')) {
    RADIUS_VALUE_RE.lastIndex = 0
    const next = decl.value.replace(
      RADIUS_VALUE_RE,
      (m, num) => {
        const n = Number(num)
        if (!Number.isFinite(n)) {
          return `${CLAMP_PX}px`
        }
        if (SCIENTIFIC_NOTATION_RE.test(String(num)) || n > RADIUS_THRESHOLD) {
          return `${CLAMP_PX}px`
        }
        return m
      },
    )
    if (next !== decl.value) {
      decl.value = next
      return true
    }
  }

  return changed
}
