import type { IJsHandlerOptions, JsHandlerResult } from '../../types'
import { createRequire } from 'node:module'
import { jsStringEscape } from '@ast-core/escape'
import MagicString from 'magic-string'
import { shouldEnableArbitraryValueFallback } from '../../shared/classname-transform'
import { transformLiteralText } from '../literal-transform'

interface OxcParseResult {
  program?: unknown
  errors?: unknown[]
}

interface OxcParser {
  parseSync: (
    filename: string,
    source: string,
    options?: { sourceType?: string, lang?: string },
  ) => OxcParseResult
}

interface LiteralNode {
  type: 'Literal'
  value?: unknown
  raw?: string
  regex?: unknown
  start?: number
  end?: number
}

interface TemplateElementNode {
  type: 'TemplateElement'
  value?: {
    raw?: string
  }
  start?: number
  end?: number
}

type OxcNode = LiteralNode | TemplateElementNode | {
  type?: string
  [key: string]: unknown
}

interface ReplacementToken {
  start: number
  end: number
  value: string
}

const require = createRequire(import.meta.url)
let oxcParser: OxcParser | false | undefined

function loadOxcParser(): OxcParser | undefined {
  if (oxcParser === false) {
    return undefined
  }
  if (oxcParser) {
    return oxcParser
  }

  try {
    oxcParser = require('oxc-parser') as OxcParser
  }
  catch {
    oxcParser = false
    return undefined
  }

  return oxcParser
}

function hasValues<T>(values: T[] | undefined): values is T[] {
  return Array.isArray(values) && values.length > 0
}

function hasUnsupportedSourceMarker(rawSource: string) {
  return rawSource.includes('eval(')
    || (rawSource.includes('weapp-tw') && rawSource.includes('ignore'))
}

function hasSupportedClassMatchSource(options: IJsHandlerOptions) {
  return options.alwaysEscape === true
    || Boolean(options.classNameSet && options.classNameSet.size > 0)
}

export function canUseOxcJsFastPath(options: IJsHandlerOptions) {
  if (options.experimentalJsFastPath !== true && options.experimentalJsFastPath !== 'oxc') {
    return false
  }

  return !options.generateMap
    && !options.wrapExpression
    && !options.moduleGraph
    && !options.moduleSpecifierReplacements
    && hasSupportedClassMatchSource(options)
    && !shouldEnableArbitraryValueFallback(options)
    && !hasValues(options.ignoreCallExpressionIdentifiers)
    && !hasValues(options.ignoreTaggedTemplateExpressionIdentifiers)
}

function getParserLang(filename?: string) {
  if (filename?.endsWith('.ts') || filename?.endsWith('.mts') || filename?.endsWith('.cts')) {
    return 'ts'
  }
  if (filename?.endsWith('.tsx')) {
    return 'tsx'
  }
  if (filename?.endsWith('.jsx')) {
    return 'jsx'
  }
  return 'js'
}

function getParserSourceType(sourceType: unknown) {
  return sourceType === 'script' || sourceType === 'module' ? sourceType : 'module'
}

function isNode(value: unknown): value is OxcNode {
  return Boolean(value && typeof value === 'object' && typeof (value as OxcNode).type === 'string')
}

function isRangeValid(start: unknown, end: unknown) {
  return typeof start === 'number' && typeof end === 'number' && start < end
}

function addStringLiteralToken(node: LiteralNode, options: IJsHandlerOptions, tokens: ReplacementToken[]) {
  if (typeof node.value !== 'string' || typeof node.raw !== 'string' || node.regex || !isRangeValid(node.start, node.end)) {
    return
  }

  const transformed = transformLiteralText(node.value, {
    ...options,
    needEscaped: true,
  })
  if (!transformed) {
    return
  }

  const start = node.start! + 1
  const end = node.end! - 1
  if (start >= end || transformed === node.raw.slice(1, -1)) {
    return
  }

  tokens.push({
    start,
    end,
    value: jsStringEscape(transformed),
  })
}

function addTemplateElementToken(
  rawSource: string,
  node: TemplateElementNode,
  options: IJsHandlerOptions,
  tokens: ReplacementToken[],
) {
  const raw = node.value?.raw
  if (typeof raw !== 'string' || !isRangeValid(node.start, node.end)) {
    return
  }

  const transformed = transformLiteralText(raw, {
    ...options,
    needEscaped: false,
  })
  if (!transformed || transformed === raw) {
    return
  }

  const first = rawSource[node.start!]
  const last = rawSource[node.end! - 1]
  const start = node.start! + (first === '`' || first === '}' ? 1 : 0)
  const end = node.end! - (last === '`' ? 1 : last === '{' ? 2 : 0)
  if (start >= end) {
    return
  }

  tokens.push({
    start,
    end,
    value: transformed,
  })
}

function collectReplacementTokens(
  rawSource: string,
  node: unknown,
  options: IJsHandlerOptions,
  tokens: ReplacementToken[],
) {
  if (!isNode(node)) {
    return
  }

  if (node.type === 'Literal') {
    addStringLiteralToken(node as LiteralNode, options, tokens)
  }
  else if (node.type === 'TemplateElement') {
    addTemplateElementToken(rawSource, node as TemplateElementNode, options, tokens)
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        collectReplacementTokens(rawSource, item, options, tokens)
      }
      continue
    }

    collectReplacementTokens(rawSource, value, options, tokens)
  }
}

export function oxcJsHandler(rawSource: string, options: IJsHandlerOptions): JsHandlerResult | undefined {
  if (!canUseOxcJsFastPath(options)) {
    return undefined
  }
  if (hasUnsupportedSourceMarker(rawSource)) {
    return undefined
  }

  const parser = loadOxcParser()
  if (!parser) {
    return undefined
  }

  let result: OxcParseResult
  try {
    result = parser.parseSync(options.filename ?? 'weapp-tailwindcss.js', rawSource, {
      sourceType: getParserSourceType(options.babelParserOptions?.sourceType),
      lang: getParserLang(options.filename),
    })
  }
  catch {
    return undefined
  }

  if (!result.program || (Array.isArray(result.errors) && result.errors.length > 0)) {
    return undefined
  }

  const tokens: ReplacementToken[] = []
  collectReplacementTokens(rawSource, result.program, options, tokens)
  if (tokens.length === 0) {
    return {
      code: rawSource,
    }
  }

  const ms = new MagicString(rawSource)
  tokens.sort((a, b) => b.start - a.start)
  for (const token of tokens) {
    ms.update(token.start, token.end, token.value)
  }

  return {
    code: ms.toString(),
  }
}
