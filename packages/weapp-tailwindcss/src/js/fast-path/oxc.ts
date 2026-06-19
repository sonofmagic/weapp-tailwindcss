import type { IJsHandlerOptions, JsHandlerResult } from '../../types'
import { createRequire } from 'node:module'
import process from 'node:process'
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

interface ReplacementContext {
  ms?: MagicString
}

const require = createRequire(import.meta.url)
const NODE_STRUCTURAL_KEYS = new Set([
  'type',
  'start',
  'end',
  'loc',
  'range',
  'raw',
  'regex',
  'comments',
  'errors',
])
let oxcParser: OxcParser | false | undefined

export function isOxcParserRuntimeSupported(version = process.versions.node) {
  const match = /^(\d+)\.(\d+)(?:\.|$)/.exec(version)
  if (!match) {
    return false
  }
  const major = Number(match[1])
  const minor = Number(match[2])
  if (major === 20) {
    return minor >= 19
  }
  if (major === 21) {
    return false
  }
  if (major === 22) {
    return minor >= 12
  }
  return major > 22
}

function loadOxcParser(): OxcParser | undefined {
  if (!isOxcParserRuntimeSupported()) {
    return undefined
  }
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

function getMagicString(rawSource: string, context: ReplacementContext) {
  if (!context.ms) {
    context.ms = new MagicString(rawSource)
  }
  return context.ms
}

function addStringLiteralReplacement(
  rawSource: string,
  node: LiteralNode,
  transformOptions: IJsHandlerOptions,
  context: ReplacementContext,
) {
  if (typeof node.value !== 'string' || typeof node.raw !== 'string' || node.regex || !isRangeValid(node.start, node.end)) {
    return false
  }

  const transformed = transformLiteralText(node.value, transformOptions)
  if (!transformed) {
    return false
  }

  const start = node.start! + 1
  const end = node.end! - 1
  if (start >= end || transformed === rawSource.slice(start, end)) {
    return false
  }

  getMagicString(rawSource, context).update(start, end, jsStringEscape(transformed))
  return true
}

function addTemplateElementReplacement(
  rawSource: string,
  node: TemplateElementNode,
  transformOptions: IJsHandlerOptions,
  context: ReplacementContext,
) {
  const raw = node.value?.raw
  if (typeof raw !== 'string' || !isRangeValid(node.start, node.end)) {
    return false
  }

  const transformed = transformLiteralText(raw, transformOptions)
  if (!transformed || transformed === raw) {
    return false
  }

  const first = rawSource[node.start!]
  const last = rawSource[node.end! - 1]
  const start = node.start! + (first === '`' || first === '}' ? 1 : 0)
  const end = node.end! - (last === '`' ? 1 : last === '{' ? 2 : 0)
  if (start >= end) {
    return false
  }

  getMagicString(rawSource, context).update(start, end, transformed)
  return true
}

function applyReplacements(
  rawSource: string,
  node: unknown,
  stringLiteralOptions: IJsHandlerOptions,
  templateLiteralOptions: IJsHandlerOptions,
  context: ReplacementContext,
) {
  if (!isNode(node)) {
    return false
  }

  let changed = false
  if (node.type === 'Literal') {
    changed = addStringLiteralReplacement(rawSource, node as LiteralNode, stringLiteralOptions, context)
  }
  else if (node.type === 'TemplateElement') {
    changed = addTemplateElementReplacement(rawSource, node as TemplateElementNode, templateLiteralOptions, context)
  }

  for (const key in node) {
    if (NODE_STRUCTURAL_KEYS.has(key)) {
      continue
    }
    const value = node[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          changed = applyReplacements(rawSource, item, stringLiteralOptions, templateLiteralOptions, context) || changed
        }
      }
      continue
    }

    if (value && typeof value === 'object') {
      changed = applyReplacements(rawSource, value, stringLiteralOptions, templateLiteralOptions, context) || changed
    }
  }

  return changed
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

  const stringLiteralOptions = options.needEscaped === true
    ? options
    : {
        ...options,
        needEscaped: true,
      }
  const templateLiteralOptions = options.needEscaped === false
    ? options
    : {
        ...options,
        needEscaped: false,
      }
  const replacementContext: ReplacementContext = {}
  if (!applyReplacements(rawSource, result.program, stringLiteralOptions, templateLiteralOptions, replacementContext)) {
    return {
      code: rawSource,
    }
  }

  return {
    code: replacementContext.ms!.toString(),
  }
}
