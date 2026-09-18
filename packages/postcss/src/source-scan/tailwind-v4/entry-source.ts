import { isTailwindV4CssImportParam, isTailwindV4PreflightImportParam } from '../../compat/tailwindcss-v4/preflight-imports'
import { postcss } from '../../postcss-runtime'
import { collectCssInlineSourceCandidates } from '../inline-source'
import { parseConfigParam, parseSourceFileParam } from '../params'

function parseImportSourceParam(params: string) {
  const match = /\bsource\(\s*(none|(['"])(.*?)\2)\s*\)/.exec(params)
  if (!match) {
    return undefined
  }
  return {
    none: match[1] === 'none',
    sourcePath: match[3],
  }
}

function collectSourceDirectives(root: postcss.Root) {
  const sourceRequests: Array<NonNullable<ReturnType<typeof parseSourceFileParam>>> = []
  let importSourcePath: string | undefined
  let hasSourceNone = false
  let hasTailwindCssImport = false
  let includesPreflight = false
  root.walkAtRules((rule) => {
    if (rule.name === 'source') {
      const request = parseSourceFileParam(rule.params)
      if (request) {
        sourceRequests.push(request)
      }
    }
    else if (rule.name === 'import' && isTailwindV4CssImportParam(rule.params)) {
      hasTailwindCssImport = true
      includesPreflight ||= isTailwindV4PreflightImportParam(rule.params)
      const sourceParam = parseImportSourceParam(rule.params)
      hasSourceNone ||= sourceParam?.none === true
      if (sourceParam?.sourcePath) {
        importSourcePath = sourceParam.sourcePath
      }
    }
    else if (rule.name === 'tailwind') {
      includesPreflight ||= rule.params.trim() === 'base'
    }
  })
  return {
    sourceRequests,
    importSourcePath,
    hasSourceNone,
    hasTailwindCssImport,
    includesPreflight,
    inlineCandidates: collectCssInlineSourceCandidates(root),
  }
}

/** 复用本次解析；命中配置缓存时不展开 inline 候选。 */
export function analyzeTailwindV4EntrySource(css: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return undefined
  }
  const configRequests = new Set<string>()
  root.walkAtRules('config', (rule) => {
    const request = parseConfigParam(rule.params)
    if (request) {
      configRequests.add(request)
    }
  })
  let directives: ReturnType<typeof collectSourceDirectives> | undefined
  return {
    configRequests: [...configRequests],
    getSourceDirectives() {
      return directives ??= collectSourceDirectives(root)
    },
  }
}

export type TailwindV4EntrySourceAnalysis = NonNullable<ReturnType<typeof analyzeTailwindV4EntrySource>>
