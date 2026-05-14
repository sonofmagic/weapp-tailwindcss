import type { Root } from 'postcss'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import micromatch from 'micromatch'

export interface TailwindSourceEntry {
  base: string
  pattern: string
  negated: boolean
}

export interface TailwindInlineSourceCandidates {
  included: Set<string>
  excluded: Set<string>
}

interface LegacyContentObject {
  files?: LegacyContentConfig
  relative?: boolean
}

type LegacyContentConfig
  = | string
    | string[]
    | LegacyContentObject
    | Array<string | LegacyContentObject>

export const DEFAULT_SOURCE_SCAN_EXTENSIONS = [
  'html',
  'wxml',
  'axml',
  'jxml',
  'ksml',
  'ttml',
  'qml',
  'tyml',
  'xhsml',
  'swan',
  'vue',
  'mpx',
  'js',
  'jsx',
  'ts',
  'tsx',
]

export function createSourceScanPattern(extensions = DEFAULT_SOURCE_SCAN_EXTENSIONS) {
  return `**/*.{${extensions.join(',')}}`
}

const NUMERICAL_RANGE_RE = /^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/

export function parseConfigParam(params: string) {
  const value = params.trim()
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

function isLegacyContentObject(value: unknown): value is LegacyContentObject {
  return typeof value === 'object' && value !== null && 'files' in value
}

function normalizeGlobPattern(pattern: string) {
  return pattern.startsWith('./') ? pattern.slice(2) : pattern
}

function segmentTopLevel(input: string, separator: string) {
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
      parts.push(input.slice(lastPos, index))
      lastPos = index + 1
    }
  }
  parts.push(input.slice(lastPos))
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
  const parts = (isSequence(inner) ? expandSequence(inner) : segmentTopLevel(inner, ','))
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
  return {
    negated,
    source: match[2],
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

export function normalizeLegacyContentEntries(
  content: unknown,
  base: string,
): TailwindSourceEntry[] {
  if (typeof content === 'string') {
    const negated = content.startsWith('!')
    return [{
      base,
      negated,
      pattern: normalizeGlobPattern(negated ? content.slice(1) : content),
    }]
  }
  if (Array.isArray(content)) {
    return content.flatMap(item => normalizeLegacyContentEntries(item, base))
  }
  if (isLegacyContentObject(content)) {
    return normalizeLegacyContentEntries(content.files, base)
  }
  return []
}

async function pathExistsAsDirectory(file: string) {
  try {
    return (await stat(file)).isDirectory()
  }
  catch {
    return false
  }
}

export async function resolveTailwindSourceEntry(
  sourcePath: string,
  base: string,
  negated: boolean,
  defaultPattern = createSourceScanPattern(),
): Promise<TailwindSourceEntry> {
  const absoluteSource = path.isAbsolute(sourcePath) ? path.resolve(sourcePath) : path.resolve(base, sourcePath)
  if (await pathExistsAsDirectory(absoluteSource)) {
    return {
      base: absoluteSource,
      negated,
      pattern: normalizeGlobPattern(defaultPattern),
    }
  }

  if (path.isAbsolute(sourcePath)) {
    return {
      base: path.dirname(absoluteSource),
      negated,
      pattern: normalizeGlobPattern(path.basename(absoluteSource)),
    }
  }

  return {
    base,
    negated,
    pattern: normalizeGlobPattern(sourcePath),
  }
}

export function parseSourceFileParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('inline(')) {
    return undefined
  }

  const negated = value.startsWith('not ')
  const sourceValue = negated ? value.slice(4).trim() : value
  if (sourceValue.startsWith('inline(')) {
    return undefined
  }

  const match = /^(['"])(.+)\1$/.exec(sourceValue)
  return match?.[2]
    ? {
        negated,
        sourcePath: match[2],
      }
    : undefined
}

export async function resolveCssSourceEntries(
  root: Root,
  base: string,
  defaultPattern = createSourceScanPattern(),
) {
  const entries: TailwindSourceEntry[] = []
  const tasks: Array<Promise<TailwindSourceEntry>> = []
  root.walkAtRules('source', (rule) => {
    const parsed = parseSourceFileParam(rule.params)
    if (!parsed) {
      return
    }
    tasks.push(resolveTailwindSourceEntry(parsed.sourcePath, base, parsed.negated, defaultPattern))
  })
  entries.push(...await Promise.all(tasks))
  return entries
}

export async function expandTailwindSourceEntries(
  entries: TailwindSourceEntry[],
  options: {
    ignore?: string[]
  } = {},
) {
  const files = new Set<string>()
  const negativeEntries = entries.filter(entry => entry.negated)
  const entriesByBase = new Map<string, TailwindSourceEntry[]>()
  for (const entry of entries) {
    const base = path.resolve(entry.base)
    const group = entriesByBase.get(base) ?? []
    group.push({
      ...entry,
      base,
    })
    entriesByBase.set(base, group)
  }

  await Promise.all([...entriesByBase.entries()].map(async ([base, group]) => {
    const patterns = group.map((entry) => {
      const pattern = normalizeGlobPattern(entry.pattern)
      return entry.negated ? `!${pattern}` : pattern
    })
    if (!patterns.some(pattern => !pattern.startsWith('!'))) {
      return
    }
    const matched = await fg(patterns, {
      absolute: true,
      cwd: base,
      ignore: options.ignore,
      onlyFiles: true,
      unique: true,
    })
    for (const file of matched) {
      files.add(path.resolve(file))
    }
  }))

  return [...files].filter(file => !negativeEntries.some((entry) => {
    const relative = path.relative(path.resolve(entry.base), file).split(path.sep).join('/')
    return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, normalizeGlobPattern(entry.pattern))
  }))
}
