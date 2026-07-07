import type { OutputAsset, OutputBundle } from 'rollup'
import type { ViteFrameworkCssPipelineContext, ViteFrameworkCssPipelineStrategy } from './shared/framework-strategy'
import type { InternalUserDefinedOptions } from '@/types'
import {
  collectCssImportRequestsRoot,
  containsCssAfterMinify,
  filterExistingCssRules,
  isMiniProgramLocalCssImportRequest,
  mergeCoveredCssRuleDeclarations,
  mergeMiniProgramPreflightRuleDeclarations,
  mergeMiniProgramThemeScopeRuleDeclarations,
  parseTailwindCssDirectiveRequest,
  postcss,
  removeTailwindSourceDirectivesRoot,
  removeUnsupportedMiniProgramCssImportsRoot,
} from '@weapp-tailwindcss/postcss'
import path from 'pathe'
import { parseBundlerGeneratedCssMarkerBlocks, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { removeTailwindSourceDirectives } from '../shared/generator-css/directives'
import { isPureLocalCssImportWrapper } from '../shared/generator-css/local-imports'
import { stripGeneratorPlaceholderMarkers } from '../shared/generator-css/markers'
import { extractMarkedUserLayerComponentsCss, mergeMarkedUserLayerComponentsCss } from '../shared/generator-css/user-layer-order'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { isSubpackageOutputFile } from './generate-bundle/subpackages'

interface CssAssetMarkerMatcher {
  (asset: OutputAsset, file?: string): boolean
}

interface CssAssetProcessedMarker {
  (asset: OutputAsset, file?: string): void
}

interface CssAssetResultRecordOptions {
  injectIntoMain?: boolean | undefined
  outputFile?: string | undefined
}

interface CssAssetResultRecorder {
  (file: string, css: string, options?: CssAssetResultRecordOptions): void
}

interface CssAssetResultsGetter {
  (): Iterable<[string, string | { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }]>
}

interface CollectViteProcessedCssAssetOptions {
  opts?: InternalUserDefinedOptions | undefined
  cssPipelineStrategy?: ViteFrameworkCssPipelineStrategy | undefined
  createCssPipelineContext?: ((file: string) => ViteFrameworkCssPipelineContext) | undefined
  isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  recordViteProcessedCssAssetResult?: CssAssetResultRecorder | undefined
  resolveViteProcessedCssOutputFile?: ((file: string) => string | undefined) | undefined
  subpackageRoots?: Set<string> | undefined
  transformCss?: ((css: string, file: string) => string) | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
}

interface InjectViteProcessedCssAssetOptions {
  opts: InternalUserDefinedOptions
  cssPipelineStrategy?: ViteFrameworkCssPipelineStrategy | undefined
  createCssPipelineContext?: ((file: string) => ViteFrameworkCssPipelineContext) | undefined
  getViteProcessedCssAssetResults?: CssAssetResultsGetter | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  shouldRemoveInjectedSourceAsset?: ((file: string, record: { file: string, css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }) => boolean) | undefined
  transformCss?: ((css: string, file: string) => string) | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
  onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
}

const CSS_OUTPUT_FILE_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

function createCssAssetPipelineContext(
  options: Pick<CollectViteProcessedCssAssetOptions & InjectViteProcessedCssAssetOptions, 'createCssPipelineContext'>,
  file: string,
  bundle: OutputBundle,
) {
  const context = options.createCssPipelineContext?.(file)
  return context ? { ...context, bundle } : undefined
}

function isCssOutputFile(file: string) {
  return CSS_OUTPUT_FILE_RE.test(file)
}

function getAssetFile(bundleFile: string, asset: OutputAsset) {
  return asset.fileName || bundleFile
}

function readAssetSource(asset: OutputAsset) {
  return typeof asset.source === 'string'
    ? asset.source
    : asset.source.toString()
}

function clearAssetSource(asset: OutputAsset) {
  asset.source = ''
}

function appendCss(baseCss: string, css: string) {
  if (baseCss.length === 0) {
    return css
  }
  if (css.length === 0) {
    return baseCss
  }
  return `${baseCss}\n${css}`
}

function normalizeCssRecordIdentity(css: string) {
  return css.trim()
}

function hasNonCommentCss(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').trim().length > 0
}

function dedupeViteCssResults<T extends { css: string, outputFile?: string | undefined }>(records: T[]) {
  const seen = new Set<string>()
  return records.filter((record) => {
    const key = `${normalizeOutputPathKey(record.outputFile ?? '')}\0${normalizeCssRecordIdentity(record.css)}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function removeTailwindSourceMediaWrappersRoot(root: ReturnType<typeof postcss.parse>) {
  let changed = false
  root.walkAtRules('media', (atRule) => {
    if (!atRule.params.startsWith('source(')) {
      return
    }
    if (atRule.nodes && atRule.nodes.length > 0) {
      atRule.replaceWith(...atRule.nodes)
    }
    else {
      atRule.remove()
    }
    changed = true
  })
  if (changed) {
    root.walkAtRules((atRule) => {
      if (atRule.nodes && atRule.nodes.length === 0) {
        atRule.remove()
      }
    })
  }
  return changed
}

function removeTailwindSourceMediaWrappersFallback(css: string) {
  return css
    .replace(/@media\s+source\([^)]*\)\s*\{\s*\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\/?\s*\}/gi, '')
    .replace(/@media\s+source\([^)]*\)\s*\{\s*\}/gi, '')
}

function removeTailwindEntryDirectivesFromCss(css: string) {
  try {
    const source = stripGeneratorPlaceholderMarkers(css)
    const root = postcss.parse(source)
    const removedMediaWrappers = removeTailwindSourceMediaWrappersRoot(root)
    const removedTailwindDirectives = removeTailwindSourceDirectivesRoot(root)
    return removedMediaWrappers || removedTailwindDirectives ? root.toString() : source
  }
  catch {
    return removeTailwindSourceDirectives(removeTailwindSourceMediaWrappersFallback(css))
  }
}

interface NormalizeInjectableCssResult {
  css: string
  importedStyleFiles: Set<string>
}

function removeUnsupportedMiniProgramCssImportsFallback(css: string, file: string) {
  if (!isMiniProgramStyleOutputFile(file) || !css.includes('@import')) {
    return css
  }
  return css
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('@import')) {
        return true
      }
      const params = trimmed
        .slice('@import'.length)
        .trim()
        .replace(/;$/, '')
        .trim()
      const request = parseTailwindCssDirectiveRequest(params)
      return request === undefined || isMiniProgramLocalCssImportRequest(request)
    })
    .join('\n')
}

function normalizeInjectableCssForTarget(css: string, file: string) {
  return normalizeInjectableCssForTargetWithImports(css, file).css
}

function normalizeInjectableCssForTargetWithImports(css: string, file: string): NormalizeInjectableCssResult {
  if (!css.includes('@import')) {
    return {
      css,
      importedStyleFiles: new Set(),
    }
  }
  try {
    const root = postcss.parse(css)
    const changed = isMiniProgramStyleOutputFile(file)
      ? removeUnsupportedMiniProgramCssImportsRoot(root)
      : false
    const importedStyleFiles = collectImportedStyleFilesRoot(root, file)
    return {
      css: changed ? root.toString() : css,
      importedStyleFiles: importedStyleFiles.size > 0
        ? importedStyleFiles
        : collectImportedStyleFilesFallback(css, file),
    }
  }
  catch {
    const fallbackCss = removeUnsupportedMiniProgramCssImportsFallback(css, file)
    return {
      css: fallbackCss,
      importedStyleFiles: collectImportedStyleFiles(fallbackCss, file),
    }
  }
}

function stripStyleExtension(file: string) {
  return file.replace(/[?#].*$/, '').replace(/\.(?:css|wxss|acss|ttss|qss|jxss|tyss|scss|sass|less|styl|stylus|pcss|postcss)$/i, '')
}

function isStyleImportRequest(request: string | undefined) {
  return typeof request === 'string'
    && request.length > 0
    && !/^(?:https?:)?\/\//i.test(request)
    && /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(request)
}

function resolveImportedStyleFile(targetFile: string, request: string | undefined) {
  if (!isStyleImportRequest(request)) {
    return
  }
  const cleanRequest = request!.replace(/[?#].*$/, '')
  if (cleanRequest.startsWith('/')) {
    return normalizeOutputPathKey(cleanRequest.slice(1))
  }
  const targetDir = path.posix.dirname(normalizeOutputPathKey(targetFile))
  return normalizeOutputPathKey(path.posix.join(targetDir === '.' ? '' : targetDir, cleanRequest))
}

function collectImportedStyleFilesFromRequests(requests: Iterable<string>, targetFile: string) {
  const imports = new Set<string>()
  for (const request of requests) {
    const importedFile = resolveImportedStyleFile(targetFile, request)
    if (importedFile) {
      imports.add(importedFile)
    }
  }
  return imports
}

function collectImportedStyleFilesRoot(root: ReturnType<typeof postcss.parse>, targetFile: string) {
  return collectImportedStyleFilesFromRequests(collectCssImportRequestsRoot(root), targetFile)
}

function collectImportedStyleFilesFallback(css: string, targetFile: string) {
  const requests = [...css.matchAll(/@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s;)]+))/g)]
    .map(match => match[1] ?? match[2] ?? match[3])
    .filter((request): request is string => typeof request === 'string' && request.length > 0)
  return collectImportedStyleFilesFromRequests(requests, targetFile)
}

function collectImportedStyleFiles(css: string, targetFile: string) {
  if (!css.includes('@import')) {
    return new Set<string>()
  }
  try {
    const imports = collectImportedStyleFilesRoot(postcss.parse(css), targetFile)
    return imports.size > 0 ? imports : collectImportedStyleFilesFallback(css, targetFile)
  }
  catch {
  }
  return collectImportedStyleFilesFallback(css, targetFile)
}

function normalizeMarkerOutputFile(
  markerFile: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  return resolveViteProcessedCssOutputFile?.(markerFile) ?? markerFile
}

function isMatchingGeneratedCssMarkerFile(
  targetFile: string,
  markerFile: string | undefined,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  if (!markerFile) {
    return false
  }
  const targetKey = normalizeOutputPathKey(stripStyleExtension(targetFile))
  const markerKey = normalizeOutputPathKey(stripStyleExtension(normalizeMarkerOutputFile(
    markerFile,
    resolveViteProcessedCssOutputFile,
  )))
  return targetKey === markerKey
}

function resolveViteProcessedCssAssetSource(
  file: string,
  rawSource: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const blocks = parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
  if (blocks.length <= 1) {
    return stripBundlerGeneratedCssMarkers(rawSource)
  }
  const matchedCss = blocks
    .filter(block => isMatchingGeneratedCssMarkerFile(file, block.file, resolveViteProcessedCssOutputFile))
    .map(block => block.css)
  return matchedCss.length > 0
    ? matchedCss.join('\n')
    : stripBundlerGeneratedCssMarkers(rawSource)
}

function collectMatchingGeneratedCssMarkerFiles(
  file: string,
  rawSource: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  return parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
    .filter(block => isMatchingGeneratedCssMarkerFile(file, block.file, resolveViteProcessedCssOutputFile))
    .map(block => block.file)
    .filter((markerFile): markerFile is string => typeof markerFile === 'string' && markerFile.length > 0)
}

function collectRootStyleBundleCssSources(bundle: OutputBundle, excludedFile: string) {
  const sources: string[] = []
  const excludedFileKey = normalizeOutputPathKey(excludedFile)
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = normalizeOutputPathKey(getAssetFile(bundleFile, output))
    if (file === excludedFileKey || !isRootStyleOutputFile(file)) {
      continue
    }
    const source = stripBundlerGeneratedCssMarkers(readAssetSource(output)).trim()
    if (source.length > 0) {
      sources.push(source)
    }
  }
  return sources
}

function isHtmlOutputFile(file: string) {
  return /\.html(?:$|[?#])/i.test(file)
}

function stripQueryAndHash(file: string) {
  return file.replace(/[?#].*$/, '')
}

function resolveHtmlLinkedStyleFile(htmlFile: string, request: string) {
  if (!isStyleImportRequest(request)) {
    return
  }
  const cleanRequest = stripQueryAndHash(request)
  if (cleanRequest.startsWith('/')) {
    return normalizeOutputPathKey(cleanRequest.slice(1))
  }
  const htmlDir = path.posix.dirname(normalizeOutputPathKey(stripQueryAndHash(htmlFile)))
  return normalizeOutputPathKey(path.posix.join(htmlDir === '.' ? '' : htmlDir, cleanRequest))
}

function collectHtmlLinkedStyleFiles(bundle: OutputBundle) {
  const linkedFiles = new Set<string>()
  const linkedBasenames = new Set<string>()
  const linkHrefRE = /<link\s[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>/gi
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const htmlFile = getAssetFile(bundleFile, output)
    if (!isHtmlOutputFile(htmlFile)) {
      continue
    }
    const html = readAssetSource(output)
    for (const match of html.matchAll(linkHrefRE)) {
      const href = match[2]
      if (!href) {
        continue
      }
      const linkedFile = resolveHtmlLinkedStyleFile(htmlFile, href)
      if (!linkedFile || !isRootStyleOutputFile(linkedFile)) {
        continue
      }
      linkedFiles.add(linkedFile)
      linkedBasenames.add(path.posix.basename(linkedFile))
    }
  }
  return { linkedBasenames, linkedFiles }
}

function isLinkedStyleFile(file: string, linked: ReturnType<typeof collectHtmlLinkedStyleFiles>) {
  const fileKey = normalizeOutputPathKey(stripQueryAndHash(file))
  return linked.linkedFiles.has(fileKey)
    || (
      isRootStyleOutputFile(fileKey)
      && linked.linkedBasenames.has(path.posix.basename(fileKey))
    )
}

export function removeDuplicateUnlinkedRootCssAssetsReferencedByHtml(
  bundle: OutputBundle,
  options: {
    debug?: ((format: string, ...args: unknown[]) => void) | undefined
  } = {},
) {
  const linked = collectHtmlLinkedStyleFiles(bundle)
  if (linked.linkedFiles.size === 0 && linked.linkedBasenames.size === 0) {
    return 0
  }
  const linkedSources = new Set<string>()
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (!isCssOutputFile(file) || isMiniProgramStyleOutputFile(file) || !isLinkedStyleFile(file, linked)) {
      continue
    }
    const source = stripBundlerGeneratedCssMarkers(readAssetSource(output)).trim()
    if (source.length > 0) {
      linkedSources.add(source)
    }
  }
  if (linkedSources.size === 0) {
    return 0
  }
  let removed = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !isRootStyleOutputFile(file)
      || isMiniProgramStyleOutputFile(file)
      || isLinkedStyleFile(file, linked)
    ) {
      continue
    }
    const source = stripBundlerGeneratedCssMarkers(readAssetSource(output)).trim()
    if (!linkedSources.has(source)) {
      continue
    }
    delete bundle[bundleFile]
    options.debug?.('remove duplicate unlinked root css asset referenced by html: %s', file)
    removed++
  }
  return removed
}

const VUE_SCOPED_ATTR_RE = /\[data-v-[^\]]+\]/gi
const VUE_SCOPED_CLASS_RE = /\.data-v-[\w-]+/gi

function hasVueScopedAttr(value: string) {
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  const matched = VUE_SCOPED_ATTR_RE.test(value) || VUE_SCOPED_CLASS_RE.test(value)
  VUE_SCOPED_ATTR_RE.lastIndex = 0
  VUE_SCOPED_CLASS_RE.lastIndex = 0
  return matched
}

function normalizeCssSignatureValue(value: string) {
  return value
    .replace(VUE_SCOPED_ATTR_RE, '')
    .replace(VUE_SCOPED_CLASS_RE, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

function createDeclarationSignature(rule: postcss.Rule) {
  return createDeclarationKeys(rule).sort().join(';')
}

function createRuleCoverageKey(selector: string, declarations: string) {
  return `${normalizeCssSignatureValue(selector)}\0${declarations}`
}

function createDeclarationKeys(rule: postcss.Rule) {
  return (rule.nodes ?? [])
    .filter((node): node is postcss.Declaration => node.type === 'decl')
    .map(node => `${node.prop}:${normalizeCssSignatureValue(node.value)}${node.important ? '!important' : ''}`)
}

function createAtRuleCoverageKey(atRule: postcss.AtRule) {
  return `${atRule.name}\0${normalizeCssSignatureValue(atRule.params)}\0${normalizeCssSignatureValue(atRule.toString())}`
}

function hasClassSelector(selector: string) {
  return /(?:^|[^\\])\.[_a-z\u00A0-\uFFFF-]/i.test(normalizeCssSignatureValue(selector))
}

function isLikelyTailwindGlobalSelector(selector: string) {
  const normalized = normalizeCssSignatureValue(selector)
  return normalized === '*'
    || normalized.startsWith('::')
    || normalized.startsWith(':root')
    || normalized.startsWith(':host')
    || /^(?:html|body|hr|abbr|h1|h2|h3|h4|h5|h6|a|b|strong|code|kbd|samp|small|sub|sup|table|button|input|select|optgroup|textarea|summary|blockquote|dl|dd|fieldset|legend|ol|ul|menu|dialog|progress|video|audio|canvas|embed|iframe|img|object|svg|details|template|[uo]ni-progress)(?:$|[:,[\s>+~.#])/.test(normalized)
}

function isLikelyTailwindGlobalRule(rule: postcss.Rule) {
  return (rule.selectors ?? [rule.selector]).every(selector =>
    !hasClassSelector(selector) && isLikelyTailwindGlobalSelector(selector),
  )
}

function isLikelyTailwindPropertyAtRule(atRule: postcss.AtRule) {
  return atRule.name.toLowerCase() === 'property'
    && normalizeCssSignatureValue(atRule.params).startsWith('--tw-')
}

const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set(['view', 'text', '::after', '::before'])
const MINI_PROGRAM_PREFLIGHT_DECLARATIONS = new Set(['box-sizing', 'margin', 'padding', 'border'])

function isMiniProgramTailwindPreflightDeclaration(decl: postcss.Declaration) {
  return decl.prop.startsWith('--tw-') || MINI_PROGRAM_PREFLIGHT_DECLARATIONS.has(decl.prop)
}

function isUnscopedMiniProgramTailwindPreflightRule(rule: postcss.Rule) {
  const selectors = rule.selectors ?? [rule.selector]
  if (
    selectors.length === 0
    || !selectors.every((selector) => {
      const normalized = normalizeCssSignatureValue(selector)
      return !hasVueScopedAttr(selector) && MINI_PROGRAM_PREFLIGHT_SELECTORS.has(normalized)
    })
  ) {
    return false
  }
  const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
  return declarations.length > 0 && declarations.every(isMiniProgramTailwindPreflightDeclaration)
}

function hasUnscopedMiniProgramTailwindPreflightRule(css: string) {
  return /(?:^|[{}])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{/.test(css)
}

function collectRootScopedComparableCssCoverage(cssSources: string[]) {
  const rules = new Set<string>()
  const atRules = new Set<string>()
  const declarationsBySelector = new Map<string, Set<string>>()
  for (const source of cssSources) {
    try {
      const root = postcss.parse(source)
      root.walkRules((rule) => {
        const declarations = createDeclarationSignature(rule)
        if (declarations.length === 0) {
          return
        }
        for (const selector of rule.selectors ?? [rule.selector]) {
          const normalizedSelector = normalizeCssSignatureValue(selector)
          rules.add(`${normalizedSelector}\0${declarations}`)
          const selectorDeclarations = declarationsBySelector.get(normalizedSelector) ?? new Set<string>()
          for (const declaration of createDeclarationKeys(rule)) {
            selectorDeclarations.add(declaration)
          }
          declarationsBySelector.set(normalizedSelector, selectorDeclarations)
        }
      })
      root.walkAtRules((atRule) => {
        atRules.add(createAtRuleCoverageKey(atRule))
      })
    }
    catch {
    }
  }
  return { rules, atRules, declarationsBySelector }
}

function isRuleCoveredByRootCss(rule: postcss.Rule, coverage: ReturnType<typeof collectRootScopedComparableCssCoverage>) {
  const declarations = createDeclarationSignature(rule)
  if (declarations.length === 0) {
    return false
  }
  const selectors = rule.selectors ?? [rule.selector]
  if (selectors.every(selector => coverage.rules.has(createRuleCoverageKey(selector, declarations)))) {
    return true
  }
  const declarationKeys = createDeclarationKeys(rule)
  return declarationKeys.length > 0
    && selectors.every((selector) => {
      const rootDeclarations = coverage.declarationsBySelector.get(normalizeCssSignatureValue(selector))
      return rootDeclarations != null && declarationKeys.every(declaration => rootDeclarations.has(declaration))
    })
}

function removeScopedCssCoveredByRootStyleSources(css: string, rootSources: string[]) {
  if (!hasVueScopedAttr(css)) {
    return css
  }
  const hasScopedTailwindGeneratedCss = /tailwindcss v\d/i.test(css)
  const hasUnscopedMiniProgramPreflight = hasUnscopedMiniProgramTailwindPreflightRule(css)
  const coverage = collectRootScopedComparableCssCoverage(rootSources)
  if (coverage.rules.size === 0 && coverage.atRules.size === 0 && !hasScopedTailwindGeneratedCss && !hasUnscopedMiniProgramPreflight) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkComments((comment) => {
      if (/tailwindcss v\d/i.test(comment.text)) {
        comment.remove()
        changed = true
      }
    })
    root.walkRules((rule) => {
      if (
        isRuleCoveredByRootCss(rule, coverage)
        || (
          hasScopedTailwindGeneratedCss
          && isLikelyTailwindGlobalRule(rule)
        )
        || isUnscopedMiniProgramTailwindPreflightRule(rule)
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkAtRules((atRule) => {
      if (
        coverage.atRules.has(createAtRuleCoverageKey(atRule))
        || (
          hasScopedTailwindGeneratedCss
          && isLikelyTailwindPropertyAtRule(atRule)
        )
      ) {
        atRule.remove()
        changed = true
        return
      }
      if (atRule.nodes !== undefined && atRule.nodes.length === 0) {
        atRule.remove()
        changed = true
      }
    })
    return changed ? removeDanglingCssSourceTraceComments(root.toString()).trim() : css
  }
  catch {
    return css
  }
}

export function removeScopedTailwindPreflightCss(css: string) {
  return removeScopedCssCoveredByRootStyleSources(css, [])
}

function collectSingleViteGeneratedCssMarkerFile(rawSource: string) {
  const blocks = parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
  if (blocks.length !== 1) {
    return undefined
  }
  const file = blocks[0]?.file
  return typeof file === 'string' && file.length > 0 ? file : undefined
}

function shouldFilterRootGeneratedCssMarkerForScopedAsset(
  targetFile: string,
  markerFile: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedTargetFile = normalizeMarkerOutputFile(targetFile, resolveViteProcessedCssOutputFile)
  const resolvedMarkerFile = normalizeMarkerOutputFile(markerFile, resolveViteProcessedCssOutputFile)
  if (
    !isRootStyleOutputFile(resolvedMarkerFile)
    || isRootStyleOutputFile(resolvedTargetFile)
  ) {
    return false
  }
  return !isMatchingGeneratedCssMarkerFile(targetFile, markerFile, resolveViteProcessedCssOutputFile)
}

export function removeCssCoveredByRootStyleBundleSources(
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const rootSources = collectRootStyleBundleCssSources(bundle, file)
  const withoutExactRootCss = removeDanglingCssSourceTraceComments(removeCssCoveredByImportedViteResults(
    css,
    rootSources,
  ))
  const nextCss = removeScopedCssCoveredByRootStyleSources(withoutExactRootCss, rootSources)
  return hasNonCommentCss(nextCss) ? nextCss : ''
}

function removeDanglingCssSourceTraceComments(css: string) {
  if (!css.includes('/* tokens:')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.each((node) => {
      if (node.type !== 'comment' || !node.text.trim().startsWith('tokens:')) {
        return
      }
      const next = node.next()
      if (next?.type === 'rule' || next?.type === 'atrule') {
        return
      }
      node.remove()
      changed = true
    })
    return changed ? root.toString().trim() : css
  }
  catch {
    return css
  }
}

export function removeCssCoveredByRootStyleAssets(
  bundle: OutputBundle,
  options: {
    cssMatcher: (file: string) => boolean
    debug?: ((format: string, ...args: unknown[]) => void) | undefined
    includeTailwindGeneratedCssAssets?: boolean | undefined
    isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
    onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
    recordCssAssetResult?: CssAssetResultRecorder | undefined
    subpackageRoots?: Set<string> | undefined
  },
) {
  let updated = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    const rawSource = readAssetSource(output)
    const hasScopedCss = hasVueScopedAttr(rawSource)
    const hasTailwindGeneratedCss = /tailwindcss v\d/i.test(rawSource)
    const shouldIncludeTailwindGeneratedCssAsset = options.includeTailwindGeneratedCssAssets === true
      && hasTailwindGeneratedCss
      && isCssOutputFile(file)
      && !isMiniProgramStyleOutputFile(file)
    if (
      !(options.cssMatcher(file) || (hasScopedCss && isCssOutputFile(file)) || shouldIncludeTailwindGeneratedCssAsset)
      || isRootStyleOutputFile(file)
      || (
        options.isViteProcessedCssAsset?.(output, file) === true
        && !hasScopedCss
        && !shouldIncludeTailwindGeneratedCssAsset
      )
      || (
        options.subpackageRoots != null
        && isSubpackageOutputFile(file, options.subpackageRoots)
      )
    ) {
      continue
    }
    const nextCss = removeCssCoveredByRootStyleBundleSources(bundle, file, rawSource)
    if (nextCss === rawSource) {
      continue
    }
    output.source = nextCss
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, rawSource, nextCss)
    options.debug?.('remove root-covered css rules from scoped asset: %s bytes=%d', file, nextCss.length)
    updated++
  }
  return updated
}

function shouldInjectViteProcessedCssResult(
  opts: InternalUserDefinedOptions,
  targetFile: string,
  sourceFile: string,
  options: {
    injectIntoMain?: boolean | undefined
    outputFile?: string | undefined
  },
) {
  if (options.injectIntoMain === true) {
    return isRootStyleOutputFile(targetFile)
      || (
        typeof options.outputFile === 'string'
        && normalizeOutputPathKey(options.outputFile) === normalizeOutputPathKey(targetFile)
      )
  }
  if (options.injectIntoMain === false) {
    return false
  }
  const targetFileKey = normalizeOutputPathKey(targetFile)
  if (
    typeof options.outputFile === 'string'
    && normalizeOutputPathKey(options.outputFile) === targetFileKey
  ) {
    return true
  }
  const sourceFileKey = normalizeOutputPathKey(sourceFile)
  return sourceFileKey !== targetFileKey
    && (
      opts.mainCssChunkMatcher(sourceFile, opts.appType)
      || (
        typeof options.outputFile === 'string'
        && normalizeOutputPathKey(options.outputFile) !== targetFileKey
        && opts.mainCssChunkMatcher(options.outputFile, opts.appType)
      )
    )
}

function shouldReplayViteProcessedCssIntoMainCss(
  opts: InternalUserDefinedOptions,
  file: string,
  sourceFile: string | undefined,
  outputFile: string,
  subpackageRoots: Set<string> | undefined,
) {
  if (subpackageRoots) {
    const sourceIsSubpackage = isSubpackageOutputFile(sourceFile ?? file, subpackageRoots)
    const outputIsSubpackage = isSubpackageOutputFile(outputFile, subpackageRoots)
    if (sourceIsSubpackage || outputIsSubpackage) {
      return false
    }
  }
  return (
    isRootStyleOutputFile(file)
    && opts.mainCssChunkMatcher(file, opts.appType)
  )
  || (
    isSourceRootPrefixedOutputFile(file, outputFile)
    && isRootStyleOutputFile(outputFile)
    && opts.mainCssChunkMatcher(outputFile, opts.appType)
  )
}

function isRootStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return isCssOutputFile(normalized) && !normalized.includes('/')
}

function isMiniProgramStyleOutputFile(file: string) {
  return /\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(file)
}

function shouldPreserveMiniProgramImportShell(
  options: Pick<InjectViteProcessedCssAssetOptions, 'cssPipelineStrategy' | 'createCssPipelineContext' | 'opts'>,
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const context = createCssAssetPipelineContext(options, file, bundle)
  return context !== undefined
    && options.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
      ...context,
      css,
      file,
    }) === true
    && isMiniProgramStyleOutputFile(file)
    && options.opts.cssMatcher(file)
    && isPureLocalCssImportWrapper(css)
}

function resolvePreservedImportShellInjectionTarget(
  options: Pick<InjectViteProcessedCssAssetOptions, 'cssPipelineStrategy' | 'createCssPipelineContext'>,
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const context = createCssAssetPipelineContext(options, file, bundle)
  if (
    context === undefined
    || options.cssPipelineStrategy?.shouldNormalizeRootMiniProgramImportShell?.(context) !== true
  ) {
    return
  }
  const importedStyleFiles = collectImportedStyleFiles(css, file)
  if (importedStyleFiles.size !== 1) {
    return
  }
  const [importedFile] = importedStyleFiles
  if (!importedFile) {
    return
  }
  if (!isRootStyleOutputFile(importedFile)) {
    return
  }
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const outputFile = getAssetFile(bundleFile, output)
    if (normalizeOutputPathKey(outputFile) === normalizeOutputPathKey(importedFile)) {
      return outputFile
    }
  }
}

function shouldUseCssAssetAsMainInjectionTarget(
  opts: InternalUserDefinedOptions,
  file: string,
  records: Array<{ injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>,
  options: Pick<InjectViteProcessedCssAssetOptions, 'cssPipelineStrategy' | 'createCssPipelineContext'>,
  bundle: OutputBundle,
) {
  const context = createCssAssetPipelineContext(options, file, bundle)
  const fileKey = normalizeOutputPathKey(file)
  if (
    !isRootStyleOutputFile(file)
    && records.some(record =>
      typeof record.outputFile === 'string'
      && normalizeOutputPathKey(record.outputFile) === fileKey,
    )
  ) {
    return true
  }
  if (!isRootStyleOutputFile(file)) {
    return records.some(record =>
      record.injectIntoMain === true
      && typeof record.outputFile === 'string'
      && normalizeOutputPathKey(record.outputFile) === fileKey,
    )
  }
  const rootWebOutputTargets = records
    .map(record => typeof record.outputFile === 'string' ? normalizeOutputPathKey(record.outputFile) : undefined)
    .filter((outputFile): outputFile is string =>
      typeof outputFile === 'string'
      && isRootStyleOutputFile(outputFile)
      && !isMiniProgramStyleOutputFile(outputFile),
    )
  const matchedRootWebOutputTargets = rootWebOutputTargets.filter(outputFile =>
    opts.mainCssChunkMatcher(outputFile, opts.appType),
  )
  if (
    context !== undefined
    && options.cssPipelineStrategy?.shouldPreferMatchedRootWebOutputTarget?.({
      ...context,
      file,
      matchedRootWebOutputTargets,
    }) === true
    && !isMiniProgramStyleOutputFile(file)
    && matchedRootWebOutputTargets.length > 0
  ) {
    return matchedRootWebOutputTargets.includes(fileKey)
  }
  const explicitRootTargets = records
    .filter(record => record.injectIntoMain === true)
    .map(record => typeof record.outputFile === 'string' ? normalizeOutputPathKey(record.outputFile) : undefined)
    .filter((outputFile): outputFile is string =>
      typeof outputFile === 'string'
      && isRootStyleOutputFile(outputFile)
      && !isMiniProgramStyleOutputFile(outputFile),
    )
  const explicitWebCssTargets = records
    .filter(record => record.injectIntoMain === true)
    .map(record => typeof record.outputFile === 'string' ? normalizeOutputPathKey(record.outputFile) : undefined)
    .filter((outputFile): outputFile is string =>
      typeof outputFile === 'string'
      && isCssOutputFile(outputFile)
      && !isMiniProgramStyleOutputFile(outputFile),
    )
  if (
    context !== undefined
    && options.cssPipelineStrategy?.shouldPreferExplicitWebCssTargets?.({
      ...context,
      explicitRootTargets,
      explicitWebCssTargets,
      file,
    }) === true
    && !isMiniProgramStyleOutputFile(file)
    && explicitWebCssTargets.length > 0
  ) {
    return explicitRootTargets.includes(fileKey)
  }
  if (explicitRootTargets.length > 0) {
    return explicitRootTargets.includes(fileKey)
  }
  const explicitTargetMatched = records.some((record) => {
    if (record.injectIntoMain !== true) {
      return false
    }
    return isRootStyleOutputFile(file)
      || (
        typeof record.outputFile === 'string'
        && normalizeOutputPathKey(record.outputFile) === fileKey
      )
  })
  if (explicitTargetMatched) {
    return true
  }
  if (records.some(record => record.injectIntoMain === true)) {
    return false
  }
  if (opts.mainCssChunkMatcher(file, opts.appType)) {
    return true
  }
  return isRootStyleOutputFile(file)
    && records.some(record => record.injectIntoMain === true)
}

function isViteProcessedCssResultImported(record: { file: string, outputFile?: string | undefined }, importedStyleFiles: Set<string>) {
  return importedStyleFiles.has(normalizeOutputPathKey(record.file))
    || (
      typeof record.outputFile === 'string'
      && importedStyleFiles.has(normalizeOutputPathKey(record.outputFile))
    )
}

function isViteProcessedCssResultCoveredByImportedBundleAsset(
  record: { file: string, outputFile?: string | undefined },
  importedStyleFiles: Set<string>,
  assetFiles: Set<string>,
) {
  for (const candidate of [record.file, record.outputFile]) {
    if (typeof candidate !== 'string' || candidate.length === 0) {
      continue
    }
    const candidateKey = normalizeOutputPathKey(candidate)
    if (!importedStyleFiles.has(candidateKey)) {
      continue
    }
    if (assetFiles.has(candidateKey)) {
      return true
    }
  }
  return false
}

function removeCoveredInjectedSourceAssets(
  bundle: OutputBundle,
  targetFile: string,
  targetCss: string,
  records: Array<{ file: string, css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>,
  options: Pick<InjectViteProcessedCssAssetOptions, 'shouldRemoveInjectedSourceAsset' | 'debug'>,
) {
  let removed = 0
  const targetFileKey = normalizeOutputPathKey(targetFile)
  const targetIsRootWebStyle = isRootStyleOutputFile(targetFileKey) && !isMiniProgramStyleOutputFile(targetFileKey)
  for (const record of records) {
    if (!options.shouldRemoveInjectedSourceAsset?.(targetFile, record)) {
      continue
    }
    const recordFileKey = normalizeOutputPathKey(record.file)
    for (const [candidateFile, candidateOutput] of Object.entries(bundle)) {
      if (candidateOutput.type !== 'asset') {
        continue
      }
      const candidateKey = normalizeOutputPathKey(getAssetFile(candidateFile, candidateOutput))
      if (candidateKey === targetFileKey) {
        continue
      }
      const isRecordFile = candidateKey === recordFileKey
      const candidateIsRootWebStyle = isRootStyleOutputFile(candidateKey) && !isMiniProgramStyleOutputFile(candidateKey)
      const candidateSource = readAssetSource(candidateOutput).trim()
      const uncoveredCandidateSource = candidateSource.length > 0
        ? filterExistingCssRules(targetCss, candidateSource).trim()
        : candidateSource
      const isProcessedSource = candidateSource === record.css.trim()
        || (candidateSource.length > 0 && containsCssAfterMinify(targetCss, candidateSource))
        || (
          targetIsRootWebStyle
          && candidateIsRootWebStyle
          && candidateSource.length > 0
          && !hasNonCommentCss(uncoveredCandidateSource)
        )
      if (!isRecordFile && !isProcessedSource) {
        continue
      }
      if (candidateIsRootWebStyle && !targetIsRootWebStyle) {
        continue
      }
      if (candidateIsRootWebStyle && !isRecordFile && !isProcessedSource) {
        continue
      }
      if (candidateIsRootWebStyle) {
        delete bundle[candidateFile]
      }
      else {
        clearAssetSource(candidateOutput)
      }
      options.debug?.('remove injected vite-processed source css asset: %s -> %s', candidateKey, targetFile)
      removed++
    }
  }
  return removed
}

function removeCssCoveredByImportedViteResults(
  css: string,
  importedCssSources: string[],
) {
  if (importedCssSources.length === 0) {
    return css
  }
  const importedCss = importedCssSources
    .map(source => stripBundlerGeneratedCssMarkers(source).trim())
    .filter(Boolean)
    .join('\n')
  if (importedCss.length === 0) {
    return css
  }
  return restoreCssImportAtRules(
    css,
    removeCssRulesCoveredBySources(css, [importedCss], { exactOnly: true }),
  )
}

function removeCssRulesCoveredBySources(css: string, sources: string[], options: { exactOnly?: boolean | undefined } = {}) {
  if (sources.length === 0 || css.trim().length === 0) {
    return css
  }
  const coverage = collectRootScopedComparableCssCoverage(sources)
  const coveredRuleCss = collectNormalizedRuleCss(sources)
  if (coverage.rules.size === 0 && coverage.declarationsBySelector.size === 0 && coveredRuleCss.size === 0) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkRules((rule) => {
      if (
        !coveredRuleCss.has(normalizeCssSignatureValue(rule.toString()))
        && (options.exactOnly === true || !isRuleCoveredByRootCss(rule, coverage))
      ) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

function collectNormalizedRuleCss(sources: string[]) {
  const rules = new Set<string>()
  for (const source of sources) {
    try {
      const root = postcss.parse(source)
      root.walkRules((rule) => {
        rules.add(normalizeCssSignatureValue(rule.toString()))
      })
    }
    catch {
    }
  }
  return rules
}

function collectCssImportAtRuleCss(css: string) {
  if (!css.includes('@import')) {
    return []
  }
  const fallbackImports = [...css.matchAll(/@import\s[^;]+;?/g)].map(match => match[0])
  if (fallbackImports.length > 0) {
    return fallbackImports
  }
  try {
    const root = postcss.parse(css)
    const imports: string[] = []
    root.each((node) => {
      if (node.type === 'atrule' && node.name === 'import') {
        imports.push(node.toString())
      }
    })
    return imports
  }
  catch {
    return []
  }
}

function parseCssImportRequest(importCss: string) {
  const trimmed = importCss.trim()
  if (!trimmed.startsWith('@import')) {
    return
  }
  const params = trimmed
    .slice('@import'.length)
    .trim()
    .replace(/;$/, '')
    .trim()
  return parseTailwindCssDirectiveRequest(params)
}

function shouldRestoreCssImportAtRule(importCss: string, file?: string) {
  if (file === undefined || !isMiniProgramStyleOutputFile(file)) {
    return true
  }
  const request = parseCssImportRequest(importCss)
  if (request === undefined) {
    return false
  }
  if (isMiniProgramLocalCssImportRequest(request)) {
    return true
  }
  return isStyleImportRequest(request) && !request.includes('/')
}

function restoreCssImportAtRules(source: string, filtered: string, file?: string) {
  const imports = collectCssImportAtRuleCss(source)
    .filter(importCss => shouldRestoreCssImportAtRule(importCss, file))
  if (imports.length === 0) {
    return filtered
  }
  const missingImports = imports.filter(importCss => !filtered.includes(importCss))
  if (missingImports.length === 0) {
    return filtered
  }
  return appendCss(missingImports.join('\n'), filtered)
}

function removeCommentOnlyAtRules(css: string) {
  if (!css.includes('@')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkAtRules((atRule) => {
      if (!atRule.nodes || atRule.nodes.length === 0) {
        return
      }
      const hasCss = atRule.nodes.some(node => node.type !== 'comment')
      if (hasCss) {
        return
      }
      atRule.remove()
      changed = true
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

function collectImportedBundleCssSources(bundle: OutputBundle, importedStyleFiles: Set<string>) {
  if (importedStyleFiles.size === 0) {
    return []
  }
  const importedFileNames = new Set([...importedStyleFiles].map(file => path.posix.basename(file)))
  const importedSources: string[] = []
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = normalizeOutputPathKey(getAssetFile(bundleFile, output))
    const imported = importedStyleFiles.has(file)
      || (
        !file.includes('/')
        && importedFileNames.has(path.posix.basename(file))
      )
    if (!imported) {
      continue
    }
    importedSources.push(readAssetSource(output))
  }
  return importedSources
}

function collectBundleAssetFiles(bundle: OutputBundle) {
  const files = new Set<string>()
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    files.add(normalizeOutputPathKey(getAssetFile(bundleFile, output)))
  }
  return files
}

function normalizeComparableStyleFile(file: string) {
  return normalizeOutputPathKey(path.normalize(file.replace(/[?#].*$/, '')))
}

function collectConfiguredTailwindV4CssEntryFiles(opts: InternalUserDefinedOptions) {
  const runtimeCssEntries = (opts.tailwindRuntime as any)?.options?.tailwindcss?.v4?.cssEntries
  return [
    ...(Array.isArray(opts.cssEntries) ? opts.cssEntries : []),
    ...(Array.isArray(opts.tailwindcss?.v4?.cssEntries) ? opts.tailwindcss.v4.cssEntries : []),
    ...(Array.isArray(opts.tailwindcssRuntimeOptions?.tailwindcss?.v4?.cssEntries) ? opts.tailwindcssRuntimeOptions.tailwindcss.v4.cssEntries : []),
    ...(Array.isArray(runtimeCssEntries) ? runtimeCssEntries : []),
  ].filter((file): file is string => typeof file === 'string' && file.length > 0)
}

function isConfiguredTailwindV4CssEntryFile(opts: InternalUserDefinedOptions, file: string | undefined) {
  if (typeof file !== 'string' || file.length === 0) {
    return false
  }
  const fileKey = normalizeComparableStyleFile(file)
  return collectConfiguredTailwindV4CssEntryFiles(opts).some(entry =>
    normalizeComparableStyleFile(entry) === fileKey,
  )
}

function resolveConfiguredCssEntryRootInjectionTarget(
  bundle: OutputBundle,
  options: Pick<CollectViteProcessedCssAssetOptions, 'cssPipelineStrategy' | 'createCssPipelineContext' | 'opts'>,
  sourceFile: string | undefined,
  outputFile: string,
) {
  const opts = options.opts
  if (
    opts === undefined
    || isMiniProgramStyleOutputFile(outputFile)
    || !isConfiguredTailwindV4CssEntryFile(opts, sourceFile)
  ) {
    return
  }
  const context = createCssAssetPipelineContext(options, outputFile, bundle)
  if (context === undefined) {
    return
  }
  const resolvedByStrategy = options.cssPipelineStrategy?.resolveConfiguredCssEntryRootInjectionTarget?.({
    ...context,
    bundle,
    isConfiguredCssEntryFile: file => isConfiguredTailwindV4CssEntryFile(opts, file),
    isMiniProgramStyleOutputFile,
    isRootStyleOutputFile,
    outputFile,
    sourceFile,
  })
  if (resolvedByStrategy !== undefined) {
    return resolvedByStrategy
  }
  if (options.cssPipelineStrategy?.resolveConfiguredCssEntryRootInjectionTarget == null) {
    return
  }
  const rootCssFiles: string[] = []
  const matchedRootCssFiles: string[] = []
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !opts.cssMatcher(file)
      || !isRootStyleOutputFile(file)
      || isMiniProgramStyleOutputFile(file)
    ) {
      continue
    }
    rootCssFiles.push(file)
    if (opts.mainCssChunkMatcher(file, opts.appType)) {
      matchedRootCssFiles.push(file)
    }
  }
  if (matchedRootCssFiles.length === 1) {
    return matchedRootCssFiles[0]
  }
  if (matchedRootCssFiles.length > 1) {
    return
  }
  return rootCssFiles.length === 1 ? rootCssFiles[0] : undefined
}

function findBundleAssetByOutputFile(bundle: OutputBundle, file: string) {
  const fileKey = normalizeOutputPathKey(file)
  return Object.entries(bundle).find(([bundleFile, output]) => {
    return output.type === 'asset'
      && normalizeOutputPathKey(getAssetFile(bundleFile, output)) === fileKey
  })?.[1] as OutputAsset | undefined
}

export function isCssImportOnlyBundleAsset(
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const importedStyleFiles = collectImportedStyleFiles(css, file)
  if (importedStyleFiles.size === 0) {
    return false
  }
  let hasNonImportNode = false
  try {
    const root = postcss.parse(css)
    root.each((node) => {
      if (node.type === 'comment') {
        return
      }
      if (node.type !== 'atrule' || node.name !== 'import') {
        hasNonImportNode = true
      }
    })
  }
  catch {
    return false
  }
  if (hasNonImportNode) {
    return false
  }
  return collectImportedBundleCssSources(bundle, importedStyleFiles).length > 0
}

function isCoveredViteGeneratedSourceAsset(
  file: string,
  existingAssetFiles: Set<string>,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedOutputFile = normalizeOutputPathKey(resolveViteProcessedCssOutputFile?.(file) ?? file)
  const fileKey = normalizeOutputPathKey(file)
  return resolvedOutputFile !== fileKey && existingAssetFiles.has(resolvedOutputFile)
}

function resolveViteGeneratedCssMarkerOutputFile(
  file: string,
  markerFile: string | undefined,
  existingAssetFiles: Set<string>,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedFromFile = normalizeOutputPathKey(resolveViteProcessedCssOutputFile?.(file) ?? file)
  if (!markerFile) {
    return resolvedFromFile
  }
  const resolvedFromMarker = normalizeOutputPathKey(resolveViteProcessedCssOutputFile?.(markerFile) ?? markerFile)
  if (
    resolvedFromMarker !== resolvedFromFile
    && existingAssetFiles.has(resolvedFromMarker)
  ) {
    return resolvedFromMarker
  }
  return resolvedFromFile
}

function isSourceRootPrefixedOutputFile(file: string, outputFile: string) {
  const fileKey = normalizeOutputPathKey(file)
  const outputFileKey = normalizeOutputPathKey(outputFile)
  return fileKey !== outputFileKey && fileKey.endsWith(`/${outputFileKey}`)
}

export function collectViteProcessedCssAssetResults(
  bundle: OutputBundle,
  options: CollectViteProcessedCssAssetOptions,
) {
  let collected = 0
  const existingAssetFiles = collectBundleAssetFiles(bundle)
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (!isCssOutputFile(file) || !options.isViteProcessedCssAsset?.(output, file)) {
      continue
    }
    const rawSource = readAssetSource(output)
    let nextCss = resolveViteProcessedCssAssetSource(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )
    const singleMarkerFile = collectSingleViteGeneratedCssMarkerFile(rawSource)
    if (
      singleMarkerFile
      && (
        options.subpackageRoots == null
        || !isSubpackageOutputFile(file, options.subpackageRoots)
      )
      && shouldFilterRootGeneratedCssMarkerForScopedAsset(file, singleMarkerFile, options.resolveViteProcessedCssOutputFile)
    ) {
      nextCss = removeCssCoveredByRootStyleBundleSources(bundle, file, nextCss)
    }
    nextCss = options.transformCss?.(nextCss, file) ?? nextCss
    if (nextCss !== rawSource) {
      output.source = nextCss
    }
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    const resolvedOutputFile = resolveViteGeneratedCssMarkerOutputFile(
      file,
      singleMarkerFile,
      existingAssetFiles,
      options.resolveViteProcessedCssOutputFile,
    )
    const webviewRootCssInjectionTarget = options.opts
      ? resolveConfiguredCssEntryRootInjectionTarget(
          bundle,
          options,
          singleMarkerFile ?? file,
          resolvedOutputFile,
        )
      : undefined
    const recordOutputFile = webviewRootCssInjectionTarget ?? resolvedOutputFile
    if (
      singleMarkerFile
      && normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(file)
      && !isRootStyleOutputFile(resolvedOutputFile)
      && existingAssetFiles.has(normalizeOutputPathKey(resolvedOutputFile))
    ) {
      const targetAsset = findBundleAssetByOutputFile(bundle, resolvedOutputFile)
      if (targetAsset) {
        const targetRawSource = readAssetSource(targetAsset)
        const missingCss = filterExistingCssRules(targetRawSource, nextCss).trim()
        const targetNextCss = appendCss(targetRawSource, missingCss)
        if (targetNextCss !== targetRawSource) {
          targetAsset.source = targetNextCss
          options.markCssAssetProcessed?.(targetAsset, resolvedOutputFile)
          options.recordCssAssetResult?.(resolvedOutputFile, targetNextCss)
        }
        clearAssetSource(output)
        options.recordCssAssetResult?.(file, '')
        options.recordViteProcessedCssAssetResult?.(resolvedOutputFile, targetNextCss, {
          outputFile: resolvedOutputFile,
        })
        if (isCoveredViteGeneratedSourceAsset(file, existingAssetFiles, options.resolveViteProcessedCssOutputFile)) {
          delete bundle[bundleFile]
        }
        options.debug?.('move vite-generated css asset by marker source: %s -> %s bytes=%d', file, resolvedOutputFile, nextCss.length)
        collected++
        continue
      }
    }
    const shouldReplayIntoMainCss = options.opts != null
      && (
        webviewRootCssInjectionTarget != null
        || shouldReplayViteProcessedCssIntoMainCss(
          options.opts,
          file,
          singleMarkerFile,
          resolvedOutputFile,
          options.subpackageRoots,
        )
      )
    options.recordViteProcessedCssAssetResult?.(file, nextCss, {
      injectIntoMain: shouldReplayIntoMainCss || undefined,
      outputFile: recordOutputFile,
    })
    if (normalizeOutputPathKey(recordOutputFile) !== normalizeOutputPathKey(file)) {
      options.recordViteProcessedCssAssetResult?.(recordOutputFile, nextCss, {
        injectIntoMain: shouldReplayIntoMainCss || undefined,
        outputFile: recordOutputFile,
      })
    }
    for (const markerFile of collectMatchingGeneratedCssMarkerFiles(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )) {
      if (normalizeOutputPathKey(markerFile) === normalizeOutputPathKey(file)) {
        continue
      }
      options.recordViteProcessedCssAssetResult?.(markerFile, nextCss, {
        injectIntoMain: shouldReplayIntoMainCss || undefined,
        outputFile: recordOutputFile,
      })
      if (
        normalizeOutputPathKey(recordOutputFile) !== normalizeOutputPathKey(markerFile)
        && normalizeOutputPathKey(recordOutputFile) !== normalizeOutputPathKey(file)
      ) {
        options.recordViteProcessedCssAssetResult?.(recordOutputFile, nextCss, {
          injectIntoMain: shouldReplayIntoMainCss || undefined,
          outputFile: recordOutputFile,
        })
      }
    }
    if (isCoveredViteGeneratedSourceAsset(file, existingAssetFiles, options.resolveViteProcessedCssOutputFile)) {
      delete bundle[bundleFile]
      options.debug?.('skip covered vite-generated source css asset: %s', file)
      collected++
      continue
    }
    options.debug?.('collect vite-processed css asset: %s bytes=%d', file, nextCss.length)
    collected++
  }
  return collected
}

export function injectViteProcessedCssIntoMainCssAssets(
  bundle: OutputBundle,
  options: InjectViteProcessedCssAssetOptions,
) {
  const transformCss = (css: string, file: string) => options.transformCss?.(css, file) ?? css
  const viteCssResults = dedupeViteCssResults(
    [...(options.getViteProcessedCssAssetResults?.() ?? [])].map(([file, record]) => {
      return typeof record === 'string'
        ? { file, css: record, injectIntoMain: undefined }
        : { file, css: record.css, injectIntoMain: record.injectIntoMain, outputFile: record.outputFile }
    }),
  )
    .map(record => ({
      ...record,
      css: transformCss(record.css, record.outputFile ?? record.file),
    }))
    .filter(record => record.css.length > 0)
  let injected = 0
  for (const [bundleFile, bundleOutput] of Object.entries(bundle)) {
    let output = bundleOutput
    if (bundle[bundleFile] !== bundleOutput) {
      continue
    }
    if (output.type !== 'asset') {
      continue
    }
    let file = getAssetFile(bundleFile, output)
    if (
      !options.opts.cssMatcher(file)
      || !shouldUseCssAssetAsMainInjectionTarget(options.opts, file, viteCssResults, options, bundle)
    ) {
      continue
    }
    let originalSource = readAssetSource(output)
    if (shouldPreserveMiniProgramImportShell(options, bundle, file, originalSource)) {
      const importedTargetFile = resolvePreservedImportShellInjectionTarget(options, bundle, file, originalSource)
      if (typeof importedTargetFile === 'string') {
        options.debug?.('preserve mini-program css import shell asset: %s -> %s', file, importedTargetFile)
        const importedOutput = Object.entries(bundle).find(([candidateFile, candidate]) =>
          candidate.type === 'asset'
          && normalizeOutputPathKey(getAssetFile(candidateFile, candidate)) === normalizeOutputPathKey(importedTargetFile),
        )?.[1]
        if (importedOutput?.type === 'asset') {
          output = importedOutput
          file = importedTargetFile
          originalSource = readAssetSource(output)
        }
        else {
          continue
        }
      }
      else {
        options.debug?.('preserve mini-program css import shell asset: %s', file)
        continue
      }
    }
    const fileKey = normalizeOutputPathKey(file)
    const mainFileKey = normalizeOutputPathKey(file)
    const normalizedOriginalCss = normalizeInjectableCssForTargetWithImports(
      transformCss(removeTailwindEntryDirectivesFromCss(originalSource), file),
      file,
    )
    let nextCss = normalizedOriginalCss.css
    const importedStyleFiles = normalizedOriginalCss.importedStyleFiles
    const importedBundleCssSources = collectImportedBundleCssSources(bundle, importedStyleFiles)
    nextCss = removeCssCoveredByImportedViteResults(
      nextCss,
      importedBundleCssSources,
    )
    const importedViteCssResults = viteCssResults.filter(record => isViteProcessedCssResultImported(record, importedStyleFiles))
    const bundleAssetFiles = collectBundleAssetFiles(bundle)
    const uncoveredImportedViteCssResults = importedViteCssResults.filter(
      record => !isViteProcessedCssResultCoveredByImportedBundleAsset(record, importedStyleFiles, bundleAssetFiles),
    )
    const importedCssSources = [
      ...importedBundleCssSources,
      ...uncoveredImportedViteCssResults.map(record => record.css),
    ]
    nextCss = removeCssCoveredByImportedViteResults(nextCss, uncoveredImportedViteCssResults.map(record => record.css))
    const targetViteCssResults: typeof viteCssResults = []
    for (const record of viteCssResults) {
      if (!isRootStyleOutputFile(file)) {
        if (
          typeof record.outputFile !== 'string'
          || normalizeOutputPathKey(record.outputFile) !== fileKey
        ) {
          continue
        }
      }
      if (!shouldInjectViteProcessedCssResult(options.opts, mainFileKey, record.file, record)) {
        continue
      }
      if (isViteProcessedCssResultImported(record, importedStyleFiles)) {
        continue
      }
      targetViteCssResults.push(record)
      let css = normalizeInjectableCssForTarget(stripBundlerGeneratedCssMarkers(record.css).trim(), file).trim()
      css = removeCssCoveredByImportedViteResults(css, importedCssSources).trim()
      if (css.length === 0) {
        continue
      }
      const mergedLayerCss = mergeMarkedUserLayerComponentsCss(nextCss, css)
      if (mergedLayerCss.merged) {
        nextCss = mergedLayerCss.css
        css = extractMarkedUserLayerComponentsCss(css).rest.trim()
        if (css.length === 0) {
          continue
        }
      }
      if (containsCssAfterMinify(nextCss, css) || filterExistingCssRules(nextCss, css).length === 0) {
        continue
      }
      if (containsCssAfterMinify(nextCss, css)) {
        continue
      }
      const mergedPreflightDeclarations = mergeMiniProgramPreflightRuleDeclarations(nextCss, css)
      if (mergedPreflightDeclarations.changed) {
        nextCss = mergedPreflightDeclarations.baseCss
        css = mergedPreflightDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const mergedThemeScopeDeclarations = mergeMiniProgramThemeScopeRuleDeclarations(nextCss, css)
      if (mergedThemeScopeDeclarations.changed) {
        nextCss = mergedThemeScopeDeclarations.baseCss
        css = mergedThemeScopeDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const mergedRuleDeclarations = mergeCoveredCssRuleDeclarations(nextCss, css)
      if (mergedRuleDeclarations.changed) {
        nextCss = mergedRuleDeclarations.baseCss
        css = mergedRuleDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const missingCss = filterExistingCssRules(nextCss, css)
      if (missingCss.length === 0 || !hasNonCommentCss(missingCss) || containsCssAfterMinify(nextCss, missingCss)) {
        continue
      }
      nextCss = appendCss(nextCss, missingCss)
    }
    const finalImportedCssSources = collectImportedBundleCssSources(bundle, collectImportedStyleFiles(originalSource, file))
    nextCss = transformCss(
      removeCommentOnlyAtRules(
        restoreCssImportAtRules(
          originalSource,
          removeCssRulesCoveredBySources(nextCss, finalImportedCssSources, { exactOnly: true }).trim(),
          file,
        ),
      ),
      file,
    )
    if (nextCss.trim() === originalSource.trim()) {
      nextCss = originalSource
    }
    if (nextCss !== originalSource) {
      output.source = nextCss
      options.markCssAssetProcessed?.(output, file)
      options.recordCssAssetResult?.(file, nextCss)
      options.onUpdate?.(file, originalSource, nextCss)
      options.debug?.('inject vite-processed css into main css asset: %s bytes=%d', file, nextCss.length)
    }
    const removedSources = removeCoveredInjectedSourceAssets(bundle, file, nextCss, targetViteCssResults, options)
    if (nextCss === originalSource && removedSources === 0) {
      continue
    }
    injected++
  }
  return injected
}
