import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import { replaceWxml } from '@/wxml'

export interface CssTokenSource {
  token: string
  sources: string[]
}

export type CssTokenSourceMap = Map<string, CssTokenSource>

export type CssSourceTraceGetter = (
  entries: TailwindSourceEntry[] | undefined,
) => CssTokenSourceMap | undefined

export interface CssSourceTraceOptions {
  root?: string | undefined
}

export type CssSourceTraceUserOptions = boolean | CssSourceTraceOptions

export interface AnnotateCssSourceTraceOptions {
  opts: InternalUserDefinedOptions
  tokenSources?: CssTokenSourceMap | undefined
}

const CSS_SOURCE_TRACE_COMMENT_RE = /^\s*tokens:\s/
const TAILWIND_GENERATED_CONTAINER_TRACE_COMMENT_RE = /^\s*tokens:\s*container\s*<=\s*<tailwind generated>\s*$/i

function normalizeSelectorTokenCandidate(candidate: string) {
  return candidate
    .replace(/(?<!\\)\\:/g, ':')
    .replace(/(?<!\\)\\\//g, '/')
}

function normalizeSourcePath(source: string, root: string) {
  const resolvedRoot = path.resolve(root)
  const resolvedSource = path.resolve(source)
  const relative = path.relative(resolvedRoot, resolvedSource)
  if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
    return relative.split(path.sep).join('/')
  }
  return source.split(path.sep).join('/')
}

function getSourceTraceRoot(opts: InternalUserDefinedOptions) {
  const configured = opts.cssSourceTrace
  if (configured && typeof configured === 'object' && configured.root) {
    return configured.root
  }
  return opts.tailwindcssBasedir ?? process.cwd()
}

export function isCssSourceTraceEnabled(opts: Pick<InternalUserDefinedOptions, 'cssSourceTrace'>) {
  return opts.cssSourceTrace === true || (typeof opts.cssSourceTrace === 'object' && opts.cssSourceTrace !== null)
}

export function createCssTokenSourceMap(
  sourcesByToken: Map<string, Set<string>>,
  opts: InternalUserDefinedOptions,
): CssTokenSourceMap {
  const root = getSourceTraceRoot(opts)
  const tokenSources: CssTokenSourceMap = new Map()
  for (const [token, sources] of [...sourcesByToken.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const source: CssTokenSource = {
      token,
      sources: [...sources].map(file => normalizeSourcePath(file, root)).sort(),
    }
    tokenSources.set(token, source)
    const escaped = replaceWxml(token, { escapeMap: opts.escapeMap })
    tokenSources.set(escaped, source)
    tokenSources.set(escaped.replaceAll('\\', ''), source)
  }
  return tokenSources
}

export function createCssSourceTraceCacheSignature(
  tokenSources: CssTokenSourceMap | undefined,
  opts: Pick<InternalUserDefinedOptions, 'cssSourceTrace'>,
) {
  if (!isCssSourceTraceEnabled(opts)) {
    return 'css-source-trace:0'
  }
  if (!tokenSources?.size) {
    return 'css-source-trace:1:empty'
  }
  return `css-source-trace:1:${[...tokenSources.values()]
    .map(({ token, sources }) => `${token}<=${sources.join(',')}`)
    .sort()
    .join('|')}`
}

function getTokenSource(tokenSources: CssTokenSourceMap, token: string) {
  return tokenSources.get(token)
}

function collectRuleSourceTokens(rule: postcss.Rule, tokenSources: CssTokenSourceMap) {
  const tokens = new Map<string, CssTokenSource>()
  for (const selector of rule.selectors) {
    const classMatches = selector.matchAll(/\.((?:\\.|[^\s.#:[{>,])*)/g)
    for (const match of classMatches) {
      const rawCandidate = match[1]
      if (!rawCandidate) {
        continue
      }
      const candidates = [
        normalizeSelectorTokenCandidate(rawCandidate),
        rawCandidate,
      ]
      for (const candidate of candidates) {
        const source = getTokenSource(tokenSources, candidate)
        if (!source) {
          continue
        }
        tokens.set(source.token, source)
        break
      }
    }
  }
  return tokens
}

function removeTracedTailwindGeneratedContainerRules(root: postcss.Root) {
  root.walkRules((rule) => {
    if (!rule.selectors || rule.selectors.length !== 1 || rule.selectors[0] !== '.container') {
      return
    }
    const previous = rule.prev()
    if (previous?.type !== 'comment' || !TAILWIND_GENERATED_CONTAINER_TRACE_COMMENT_RE.test(previous.text)) {
      return
    }
    previous.remove()
    rule.remove()
  })
}

export function annotateCssSourceTrace(
  css: string,
  options: AnnotateCssSourceTraceOptions,
) {
  if (!isCssSourceTraceEnabled(options.opts) || !options.tokenSources?.size) {
    return css
  }

  try {
    const root = postcss.parse(css)
    root.walkComments((comment) => {
      if (CSS_SOURCE_TRACE_COMMENT_RE.test(comment.text)) {
        comment.remove()
      }
    })
    root.walkRules((rule) => {
      const tokens = collectRuleSourceTokens(rule, options.tokenSources!)
      if (tokens.size === 0 || !rule.parent) {
        return
      }
      const lines = [...tokens.values()].map(({ token, sources }) => {
        return `${token} <= ${sources.length > 0 ? sources.join(', ') : '<tailwind generated>'}`
      })
      const comment = postcss.comment({ text: `tokens: ${lines.join(' | ')}` })
      if (rule.raws.before !== undefined) {
        comment.raws.before = rule.raws.before
      }
      rule.raws.before = '\n'
      rule.parent.insertBefore(rule, comment)
    })
    removeTracedTailwindGeneratedContainerRules(root)
    return root.toString()
  }
  catch {
    return css
  }
}
