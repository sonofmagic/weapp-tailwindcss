import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'
import { splitCandidateTokens } from '@tailwindcss-mangle/engine'
import MagicString from 'magic-string'
import { analyzeSource, babelParse } from '@/js/babel'
import { isClassContextLiteralPath } from '@/js/class-context'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { replaceWxml } from '@/wxml'

interface RewriteCodeOptions {
  wrapExpression?: boolean
}

const EXPRESSION_WRAPPER_PREFIX = '(\n'
const EXPRESSION_WRAPPER_SUFFIX = '\n)'
const COMPONENT_RE = /(?:^|[/\\])components(?:[/\\].+)?\.(?:uvue|nvue)$/
const PAGE_RE = /(?:^|[/\\])pages(?:[/\\].+)?\.(?:uvue|nvue)$/

function createStableHash(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function extractLiteralValue(path: NodePath<StringLiteral | TemplateElement>) {
  if (path.isStringLiteral()) {
    return {
      literal: path.node.value,
      offset: 1,
    }
  }
  return {
    literal: typeof path.node.value === 'string' ? path.node.value : path.node.value.raw,
    offset: 0,
  }
}

function createAlias(fileId: string, utility: string, index: number) {
  return `wtu-${createStableHash(`${fileId}:${utility}`)}-${index.toString(36)}`
}

function isRuntimeCandidate(candidate: string, runtimeSet?: Set<string>) {
  if (!runtimeSet || runtimeSet.size === 0) {
    return false
  }
  return runtimeSet.has(candidate) || runtimeSet.has(replaceWxml(candidate))
}

export function hasTopLevelVariant(candidate: string) {
  let bracketDepth = 0
  let parenthesisDepth = 0
  let quote = ''
  let escaped = false
  for (const char of candidate) {
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) {
        quote = ''
      }
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '[') {
      bracketDepth += 1
      continue
    }
    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      continue
    }
    if (char === '(') {
      parenthesisDepth += 1
      continue
    }
    if (char === ')') {
      parenthesisDepth = Math.max(0, parenthesisDepth - 1)
      continue
    }
    if (char === ':' && bracketDepth === 0 && parenthesisDepth === 0) {
      return true
    }
  }
  return false
}

export function shouldEnableComponentLocalStyle(id: string) {
  return COMPONENT_RE.test(id)
}

export function shouldEnablePageLocalStyle(id: string) {
  return PAGE_RE.test(id)
}

export class UniAppXComponentLocalStyleCollector {
  private aliasByUtility = new Map<string, string>()
  private aliasByLookup = new Map<string, string>()

  constructor(
    private readonly fileId: string,
    private readonly runtimeSet?: Set<string>,
  ) {}

  private ensureAlias(utility: string) {
    const cached = this.aliasByUtility.get(utility)
    if (cached) {
      return cached
    }
    const alias = createAlias(this.fileId, utility, this.aliasByUtility.size)
    this.aliasByUtility.set(utility, alias)
    this.aliasByLookup.set(utility, alias)
    this.aliasByLookup.set(replaceWxml(utility), alias)
    return alias
  }

  private rewriteLiteral(literal: string) {
    const candidates = splitCandidateTokens(literal)
    if (candidates.length === 0) {
      return literal
    }
    let rewritten = literal
    for (const candidate of candidates) {
      if (!isRuntimeCandidate(candidate, this.runtimeSet)) {
        continue
      }
      rewritten = rewritten.replace(
        candidate,
        hasTopLevelVariant(candidate) ? replaceWxml(candidate) : this.ensureAlias(candidate),
      )
    }
    return rewritten
  }

  collectAndRewriteStaticClass(literal: string) {
    return this.rewriteLiteral(literal)
  }

  collectRuntimeClasses(rawSource: string, options: RewriteCodeOptions = {}) {
    const wrapped = options.wrapExpression
      ? `${EXPRESSION_WRAPPER_PREFIX}${rawSource}${EXPRESSION_WRAPPER_SUFFIX}`
      : rawSource

    try {
      const ast = babelParse(wrapped, {
        plugins: ['typescript'],
        sourceType: options.wrapExpression ? 'module' : 'unambiguous',
      })
      const analysis = analyzeSource(ast, {}, undefined, false)
      for (const path of analysis.targetPaths) {
        const { literal } = extractLiteralValue(path)
        const candidates = splitCandidateTokens(literal)
        const classContext = options.wrapExpression || isClassContextLiteralPath(path)
        for (const candidate of candidates) {
          if (!candidate || (!classContext && !isRuntimeCandidate(candidate, this.runtimeSet))) {
            continue
          }
          if (isRuntimeCandidate(candidate, this.runtimeSet) && !hasTopLevelVariant(candidate)) {
            this.ensureAlias(candidate)
          }
        }
      }
    }
    catch {
      // 收集失败时保持现有转换链路，避免影响源码输出。
    }
  }

  rewriteTransformedCode(rawSource: string, options: RewriteCodeOptions = {}) {
    if (this.aliasByLookup.size === 0) {
      return rawSource
    }

    const wrapped = options.wrapExpression
      ? `${EXPRESSION_WRAPPER_PREFIX}${rawSource}${EXPRESSION_WRAPPER_SUFFIX}`
      : rawSource

    try {
      const ast = babelParse(wrapped, {
        plugins: ['typescript'],
        sourceType: options.wrapExpression ? 'module' : 'unambiguous',
      })
      const analysis = analyzeSource(ast, {}, undefined, false)
      if (analysis.targetPaths.length === 0) {
        return rawSource
      }
      const updater = new JsTokenUpdater()
      for (const path of analysis.targetPaths) {
        const { literal, offset } = extractLiteralValue(path)
        const candidates = splitCandidateTokens(literal)
        if (candidates.length === 0) {
          continue
        }
        let rewritten = literal
        let mutated = false
        for (const candidate of candidates) {
          const alias = this.aliasByLookup.get(candidate)
          if (!alias) {
            continue
          }
          const replaced = rewritten.replace(candidate, alias)
          if (replaced !== rewritten) {
            rewritten = replaced
            mutated = true
          }
        }
        if (!mutated || typeof path.node.start !== 'number' || typeof path.node.end !== 'number') {
          continue
        }
        updater.addToken({
          start: path.node.start + offset,
          end: path.node.end - offset,
          value: rewritten,
          path,
        })
      }
      if (updater.length === 0) {
        return rawSource
      }
      const ms = new MagicString(wrapped)
      updater.updateMagicString(ms)
      if (options.wrapExpression) {
        ms.remove(0, EXPRESSION_WRAPPER_PREFIX.length)
        ms.remove(wrapped.length - EXPRESSION_WRAPPER_SUFFIX.length, wrapped.length)
      }
      return ms.toString()
    }
    catch {
      return rawSource
    }
  }

  hasStyles() {
    return this.aliasByUtility.size > 0
  }

  toStyleBlock() {
    if (!this.hasStyles()) {
      return ''
    }
    const lines = ['<style scoped>']
    for (const [utility, alias] of this.aliasByUtility) {
      lines.push(`.${alias} {`)
      lines.push(`  @apply ${utility};`)
      lines.push('}')
    }
    lines.push('</style>')
    return `${lines.join('\n')}\n`
  }
}
