import type { Config } from 'tailwindcss'
import type { TailwindV3CandidateSource, TailwindV3GenerateOptions, TailwindV3ResolvedSource } from '../types'
import { postcss } from '@weapp-tailwindcss/postcss'

interface LegacyContentObject {
  files?: unknown
  relative?: boolean
  extract?: unknown
  transform?: unknown
}

function isLegacyContentObject(value: unknown): value is LegacyContentObject {
  return typeof value === 'object' && value !== null && 'files' in value
}

function createRawContentEntries(candidates: Iterable<string>, sources: TailwindV3CandidateSource[]) {
  const entries: Array<{ raw: string, extension: string }> = []
  const candidateContent = [...candidates].join(' ')
  if (candidateContent.length > 0) {
    entries.push({
      raw: candidateContent,
      extension: 'html',
    })
  }
  for (const source of sources) {
    entries.push({
      raw: source.content,
      extension: source.extension ?? 'html',
    })
  }
  return entries
}

export function createChangedContentEntries(candidates: Iterable<string>, sources: TailwindV3CandidateSource[]) {
  return createRawContentEntries(candidates, sources).map(entry => ({
    content: entry.raw,
    extension: entry.extension,
  }))
}

export function collectCandidates(candidates: Iterable<string> | undefined) {
  return new Set(candidates ?? [])
}

function collectApplyCandidatesFromCss(css: string) {
  if (!css.includes('@apply')) {
    return []
  }

  const candidates = new Set<string>()
  try {
    postcss.parse(css).walkAtRules('apply', (rule) => {
      for (const candidate of rule.params.split(/\s+/)) {
        const normalized = candidate.replace(/!important$/, '').trim()
        if (normalized) {
          candidates.add(normalized)
        }
      }
    })
  }
  catch {
    // CSS 解析失败时交给后续 Tailwind 流程报错或降级处理。
  }
  return [...candidates]
}

function isTailwindCandidateLayer(params: string) {
  return params.split(/[,\s]+/).some(layer => layer === 'components' || layer === 'utilities')
}

function extractClassCandidatesFromSelector(selector: string, candidates: Set<string>) {
  for (let index = 0; index < selector.length; index++) {
    if (selector[index] !== '.') {
      continue
    }

    let candidate = ''
    let escaped = false
    for (let tokenIndex = index + 1; tokenIndex < selector.length; tokenIndex++) {
      const char = selector[tokenIndex]
      if (escaped) {
        candidate += char
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char && /[\w-]/.test(char)) {
        candidate += char
        continue
      }
      break
    }

    if (candidate) {
      candidates.add(candidate)
    }
  }
}

function collectLayerCandidatesFromCss(css: string) {
  if (!css.includes('@layer')) {
    return []
  }

  const candidates = new Set<string>()
  try {
    postcss.parse(css).walkAtRules('layer', (layer) => {
      if (!isTailwindCandidateLayer(layer.params)) {
        return
      }
      layer.walkRules((rule) => {
        extractClassCandidatesFromSelector(rule.selector, candidates)
      })
    })
  }
  catch {
    // CSS 解析失败时交给后续 Tailwind 流程报错或降级处理。
  }
  return [...candidates]
}

export function mergeGenerateCandidates(source: TailwindV3ResolvedSource, options: TailwindV3GenerateOptions) {
  return collectCandidates([
    ...collectLayerCandidatesFromCss(source.css),
    ...collectApplyCandidatesFromCss(source.css),
    ...collectCandidates(options.candidates),
  ])
}

function mergeContent(content: unknown, rawEntries: Array<{ raw: string, extension: string }>) {
  if (isLegacyContentObject(content)) {
    return {
      ...content,
      relative: content.relative ?? true,
      files: [
        ...([] as unknown[]).concat(content.files ?? []),
        ...rawEntries,
      ],
    }
  }

  return {
    relative: true,
    files: [
      ...([] as unknown[]).concat(content ?? []),
      ...rawEntries,
    ],
  }
}

export function normalizeConfigObject(config: Config | undefined) {
  if (!config || typeof config !== 'object') {
    return config
  }
  const maybeDefault = (config as { default?: unknown }).default
  if (maybeDefault && typeof maybeDefault === 'object') {
    return maybeDefault as Config
  }
  return config
}

function hasExplicitContentInput(options: TailwindV3GenerateOptions) {
  return options.candidates !== undefined || options.sources !== undefined
}

function createExplicitContentConfig(rawEntries: Array<{ raw: string, extension: string }>) {
  return {
    relative: true,
    files: rawEntries,
  }
}

export function createTailwindConfig(source: TailwindV3ResolvedSource, options: TailwindV3GenerateOptions) {
  const config = {
    ...(normalizeConfigObject(source.configObject) ?? {}),
  } as Config
  const candidates = mergeGenerateCandidates(source, options)
  const rawEntries = createRawContentEntries(candidates, options.sources ?? [])
  config.content = hasExplicitContentInput(options)
    ? createExplicitContentConfig(rawEntries) as Config['content']
    : mergeContent(config.content, rawEntries) as Config['content']
  return config
}
