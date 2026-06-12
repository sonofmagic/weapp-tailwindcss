import type { Root } from '@weapp-tailwindcss/postcss'

export interface TailwindInlineSourceCandidates {
  included: Set<string>
  excluded: Set<string>
}

const NUMERICAL_RANGE_RE = /^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/

function segmentTopLevel(input: string, separator: string, options: { keepEmpty?: boolean } = {}) {
  const parts: string[] = []
  const stack: string[] = []
  let lastPos = 0
  let quote: string | undefined
  for (let index = 0; index < input.length; index++) {
    const char = input[index]
    if (char === '\\') {
      index += 1
      continue
    }
    if (quote) {
      if (char === quote) {
        quote = undefined
      }
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '(') {
      stack.push(')')
      continue
    }
    if (char === '[') {
      stack.push(']')
      continue
    }
    if (char === '{') {
      stack.push('}')
      continue
    }
    if (stack.length > 0 && char === stack[stack.length - 1]) {
      stack.pop()
      continue
    }
    if (stack.length === 0 && char === separator) {
      const part = input.slice(lastPos, index)
      if (part || options.keepEmpty) {
        parts.push(part)
      }
      lastPos = index + 1
    }
  }
  const part = input.slice(lastPos)
  if (part || options.keepEmpty) {
    parts.push(part)
  }
  return parts
}

function isSequence(value: string) {
  return NUMERICAL_RANGE_RE.test(value)
}

function expandSequence(value: string) {
  const match = value.match(NUMERICAL_RANGE_RE)
  if (!match) {
    return [value]
  }
  const [, start, end, stepValue] = match
  if (start === undefined || end === undefined) {
    return [value]
  }
  let step = stepValue ? Number.parseInt(stepValue, 10) : undefined
  const startNumber = Number.parseInt(start, 10)
  const endNumber = Number.parseInt(end, 10)
  const increasing = startNumber < endNumber
  if (step === undefined) {
    step = increasing ? 1 : -1
  }
  if (step === 0) {
    return []
  }
  if (increasing && step < 0) {
    step = -step
  }
  if (!increasing && step > 0) {
    step = -step
  }

  const result: string[] = []
  for (
    let value = startNumber;
    increasing ? value <= endNumber : value >= endNumber;
    value += step
  ) {
    result.push(String(value))
  }
  return result
}

export function expandInlineSourceCandidatePattern(pattern: string): string[] {
  const index = pattern.indexOf('{')
  if (index === -1) {
    return [pattern]
  }

  const prefix = pattern.slice(0, index)
  const rest = pattern.slice(index)
  let depth = 0
  let endIndex = -1
  for (let index = 0; index < rest.length; index++) {
    const char = rest[index]
    if (char === '{') {
      depth += 1
    }
    else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        endIndex = index
        break
      }
    }
  }
  if (endIndex === -1) {
    return [pattern]
  }

  const inner = rest.slice(1, endIndex)
  const suffix = rest.slice(endIndex + 1)
  const parts = (isSequence(inner) ? expandSequence(inner) : segmentTopLevel(inner, ',', { keepEmpty: true }))
    .flatMap(part => expandInlineSourceCandidatePattern(part))
  const suffixes = expandInlineSourceCandidatePattern(suffix)
  return suffixes.flatMap(suffix =>
    parts.map(part => `${prefix}${part}${suffix}`))
}

function parseSourceInlineParam(params: string) {
  let value = params.trim()
  const negated = value.startsWith('not ')
  if (negated) {
    value = value.slice(4).trim()
  }
  if (!value.startsWith('inline(') || !value.endsWith(')')) {
    return undefined
  }

  const inlineValue = value.slice(7, -1).trim()
  const match = /^(['"])([\s\S]*)\1$/.exec(inlineValue)
  if (!match) {
    return undefined
  }
  const source = match[2]
  if (source === undefined) {
    return undefined
  }
  return {
    negated,
    source,
  }
}

export function collectCssInlineSourceCandidates(root: Root): TailwindInlineSourceCandidates {
  const included = new Set<string>()
  const excluded = new Set<string>()
  root.walkAtRules('source', (rule) => {
    const parsed = parseSourceInlineParam(rule.params)
    if (!parsed) {
      return
    }
    const target = parsed.negated ? excluded : included
    for (const source of segmentTopLevel(parsed.source, ' ')) {
      const trimmed = source.trim()
      if (!trimmed) {
        continue
      }
      for (const candidate of expandInlineSourceCandidatePattern(trimmed)) {
        const normalized = candidate.trim()
        if (normalized) {
          target.add(normalized)
        }
      }
    }
  })
  for (const candidate of excluded) {
    included.delete(candidate)
  }
  return {
    included,
    excluded,
  }
}
