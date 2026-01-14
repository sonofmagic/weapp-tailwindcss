import type { ResetConfig } from './types'

type DeclValue = string | number | false | null | undefined

function normalizeResetSelectors(option: ResetConfig | undefined, defaults: readonly string[]) {
  const resolved = option?.selectors?.length ? option.selectors : defaults
  const normalized: string[] = []
  for (const selector of resolved) {
    const trimmed = selector.trim()
    if (!trimmed || normalized.includes(trimmed)) {
      continue
    }
    normalized.push(trimmed)
  }
  return normalized.length ? normalized : undefined
}

function convertSelectorForBase(selector: string) {
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    if (className.length > 0) {
      return `[class~="${className}"]`
    }
  }
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    if (id.length > 0) {
      return `[id="${id}"]`
    }
  }
  return selector
}

function normalizeDeclarations(
  option: ResetConfig | undefined,
  defaults: Record<string, string>,
) {
  const normalized: Record<string, string> = { ...defaults }
  const overrides = option?.declarations
  if (!overrides) {
    return normalized
  }

  const entries = Object.entries(overrides)
  for (const [prop, value] of entries) {
    const resolved = normalizeDeclarationValue(value)
    if (resolved === undefined) {
      delete normalized[prop]
    }
    else {
      normalized[prop] = resolved
    }
  }

  return normalized
}

function normalizePseudo(option: ResetConfig | undefined, defaults?: Record<string, string>) {
  const normalized: Record<string, string> = defaults ? { ...defaults } : {}
  const overrides = option?.pseudo
  if (!overrides) {
    return Object.keys(normalized).length ? normalized : undefined
  }

  const entries = Object.entries(overrides)
  for (const [prop, value] of entries) {
    const resolved = normalizeDeclarationValue(value)
    if (resolved === undefined) {
      delete normalized[prop]
    }
    else {
      normalized[prop] = resolved
    }
  }
  return Object.keys(normalized).length ? normalized : undefined
}

function normalizeDeclarationValue(value: DeclValue) {
  if (value === false || value === null || value === undefined) {
    return undefined
  }
  return typeof value === 'number' ? value.toString() : value
}

interface NormalizedResetRule {
  selectors: string[]
  declarations: Record<string, string>
  pseudo?: Record<string, string>
}

export function createResetRule(
  option: ResetConfig | undefined | false,
  defaults: {
    selectors: readonly string[]
    declarations: Record<string, string>
    pseudo?: Record<string, string>
  },
): NormalizedResetRule | undefined {
  if (option === false) {
    return undefined
  }
  const selectors = normalizeResetSelectors(option, defaults.selectors)
  if (!selectors) {
    return undefined
  }
  const declarations = normalizeDeclarations(option ?? {}, defaults.declarations)
  if (Object.keys(declarations).length === 0) {
    return undefined
  }
  const pseudo = normalizePseudo(option ?? {}, defaults.pseudo)
  return {
    selectors: selectors.map(convertSelectorForBase),
    declarations,
    pseudo,
  }
}

export type { NormalizedResetRule }
