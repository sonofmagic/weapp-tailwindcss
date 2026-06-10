import type { OutputAsset, OutputBundle } from 'rollup'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'pathe'
import postcss from 'postcss'
import { parseBundlerGeneratedCssMarkerBlocks, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { parseImportRequest, removeTailwindSourceDirectives } from '../shared/generator-css/directives'
import { extractMarkedUserLayerComponentsCss, mergeMarkedUserLayerComponentsCss } from '../shared/generator-css/user-layer-order'
import { normalizeOutputPathKey } from '../shared/module-graph'

interface CssAssetMarkerMatcher {
  (asset: OutputAsset, file?: string): boolean
}

interface CssAssetProcessedMarker {
  (asset: OutputAsset, file?: string): void
}

interface CssAssetResultRecordOptions {
  injectIntoMain?: boolean | undefined
}

interface CssAssetResultRecorder {
  (file: string, css: string, options?: CssAssetResultRecordOptions): void
}

interface CssAssetResultsGetter {
  (): Iterable<[string, string | { css: string, injectIntoMain?: boolean | undefined }]>
}

interface CollectViteProcessedCssAssetOptions {
  opts?: InternalUserDefinedOptions | undefined
  isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  recordViteProcessedCssAssetResult?: CssAssetResultRecorder | undefined
  resolveViteProcessedCssOutputFile?: ((file: string) => string | undefined) | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
}

interface InjectViteProcessedCssAssetOptions {
  opts: InternalUserDefinedOptions
  getViteProcessedCssAssetResults?: CssAssetResultsGetter | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
  onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
}

const CSS_OUTPUT_FILE_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

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

function appendCss(baseCss: string, css: string) {
  if (baseCss.length === 0) {
    return css
  }
  if (css.length === 0) {
    return baseCss
  }
  return `${baseCss}\n${css}`
}

function normalizeCssForContainment(css: string) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/::(before|after)\b/g, ':$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~()])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim()
}

function collectNormalizedCssNodes(css: string) {
  try {
    const root = postcss.parse(css)
    return (root.nodes ?? [])
      .filter(node => node.type !== 'comment')
      .map(node => normalizeCssForContainment(node.toString()))
      .filter(Boolean)
  }
  catch {
    const normalizedCss = normalizeCssForContainment(css)
    return normalizedCss ? [normalizedCss] : []
  }
}

function normalizeCssRuleKeyPart(value: string) {
  return value
    .replace(/::(before|after)\b/g, ':$1')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~(),])\s*/g, '$1')
    .trim()
}

function getRuleAtRuleChain(rule: postcss.Rule) {
  const chain: string[] = []
  let parent = rule.parent
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      chain.unshift(`@${parent.name} ${normalizeCssRuleKeyPart(parent.params)}`)
    }
    parent = parent.parent
  }
  return chain
}

function getCssRuleStructuralKey(rule: postcss.Rule) {
  const selector = normalizeCssRuleKeyPart(rule.selector)
  if (selector.length === 0) {
    return undefined
  }
  return [
    ...getRuleAtRuleChain(rule),
    selector,
  ].join('|')
}

function getCssRuleContentKey(rule: postcss.Rule) {
  const structuralKey = getCssRuleStructuralKey(rule)
  if (!structuralKey) {
    return undefined
  }
  return [
    structuralKey,
    normalizeCssForContainment(rule.toString()),
  ].join('|')
}

function collectCssRuleContentKeys(css: string) {
  const keys = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const key = getCssRuleContentKey(rule)
      if (key) {
        keys.add(key)
      }
    })
  }
  catch {
  }
  return keys
}

function normalizeCssDeclarationKey(decl: postcss.Declaration) {
  return [
    decl.prop.trim(),
    normalizeCssForContainment(decl.value),
    decl.important ? '!important' : '',
  ].join(':')
}

function collectCssRuleDeclarationKeys(rule: postcss.Rule) {
  const keys = new Set<string>()
  for (const node of rule.nodes ?? []) {
    if (node.type === 'decl') {
      keys.add(normalizeCssDeclarationKey(node))
    }
  }
  return keys
}

function collectCssRuleDeclarationProps(rule: postcss.Rule) {
  const props = new Set<string>()
  for (const node of rule.nodes ?? []) {
    if (node.type === 'decl') {
      props.add(node.prop.trim())
    }
  }
  return props
}

function collectCssRuleDeclarations(rule: postcss.Rule) {
  return (rule.nodes ?? []).filter((node): node is postcss.Declaration => node.type === 'decl')
}

function collectCssRuleDeclarationKeyMap(css: string) {
  const map = new Map<string, Set<string>>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const key = getCssRuleStructuralKey(rule)
      if (!key) {
        return
      }
      const declarations = collectCssRuleDeclarationKeys(rule)
      if (declarations.size === 0) {
        return
      }
      let existing = map.get(key)
      if (!existing) {
        existing = new Set<string>()
        map.set(key, existing)
      }
      for (const declaration of declarations) {
        existing.add(declaration)
      }
    })
  }
  catch {
  }
  return map
}

interface CssRuleDeclarationRecord {
  rule: postcss.Rule
  keys: Set<string>
  props: Set<string>
}

function collectCssRuleDeclarationRecords(root: postcss.Root) {
  const map = new Map<string, CssRuleDeclarationRecord[]>()
  root.walkRules((rule) => {
    const key = getCssRuleStructuralKey(rule)
    if (!key) {
      return
    }
    const keys = collectCssRuleDeclarationKeys(rule)
    if (keys.size === 0) {
      return
    }
    const records = map.get(key) ?? []
    records.push({
      rule,
      keys,
      props: collectCssRuleDeclarationProps(rule),
    })
    map.set(key, records)
  })
  return map
}

function isCssRuleCoveredByDeclarations(
  rule: postcss.Rule,
  baseRuleDeclarationKeys: Map<string, Set<string>>,
) {
  const key = getCssRuleStructuralKey(rule)
  if (!key) {
    return false
  }
  const baseDeclarations = baseRuleDeclarationKeys.get(key)
  if (!baseDeclarations) {
    return false
  }
  const declarations = collectCssRuleDeclarationKeys(rule)
  return declarations.size > 0
    && [...declarations].every(declaration => baseDeclarations.has(declaration))
}

function mergeCoveredCssRuleDeclarations(baseCss: string, css: string) {
  try {
    const baseRoot = postcss.parse(baseCss)
    const root = postcss.parse(css)
    const baseRuleRecords = collectCssRuleDeclarationRecords(baseRoot)
    let changedBase = false
    let changedCss = false

    root.walkRules((rule) => {
      const key = getCssRuleStructuralKey(rule)
      const records = key ? baseRuleRecords.get(key) : undefined
      if (!records || records.length === 0) {
        return
      }
      const incomingDeclarations = collectCssRuleDeclarations(rule)
      if (incomingDeclarations.length === 0) {
        return
      }
      const baseKeys = new Set(records.flatMap(record => [...record.keys]))
      const coveredDeclarations = incomingDeclarations.filter(decl => baseKeys.has(normalizeCssDeclarationKey(decl)))
      if (coveredDeclarations.length === 0) {
        return
      }
      const missingDeclarations = incomingDeclarations.filter(decl => !baseKeys.has(normalizeCssDeclarationKey(decl)))
      if (missingDeclarations.length === 0) {
        rule.remove()
        changedCss = true
        return
      }

      const baseProps = new Set(records.flatMap(record => [...record.props]))
      const conflictingDeclarations = missingDeclarations.filter(decl => baseProps.has(decl.prop.trim()))
      if (conflictingDeclarations.length > 0) {
        return
      }

      const targetRecord = records[0]
      for (const decl of missingDeclarations) {
        targetRecord.rule.append(decl.clone())
        targetRecord.keys.add(normalizeCssDeclarationKey(decl))
        targetRecord.props.add(decl.prop.trim())
      }
      rule.remove()
      changedBase = true
      changedCss = true
    })

    if (!changedBase && !changedCss) {
      return { baseCss, css, changed: false }
    }
    removeEmptyAtRules(root)
    return {
      baseCss: changedBase ? baseRoot.toString() : baseCss,
      css: changedCss ? root.toString().trim() : css,
      changed: true,
    }
  }
  catch {
    return { baseCss, css, changed: false }
  }
}

function removeEmptyAtRules(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (atRule.nodes && atRule.nodes.length === 0) {
      atRule.remove()
    }
  })
}

function filterExistingCssRules(baseCss: string, css: string) {
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  if (baseRuleKeys.size === 0) {
    return css
  }
  try {
    const root = postcss.parse(css)
    const baseRuleDeclarationKeys = collectCssRuleDeclarationKeyMap(baseCss)
    let changed = false
    root.walkRules((rule) => {
      const key = getCssRuleContentKey(rule)
      if (
        (key && baseRuleKeys.has(key))
        || isCssRuleCoveredByDeclarations(rule, baseRuleDeclarationKeys)
      ) {
        rule.remove()
        changed = true
      }
    })
    if (!changed) {
      return css
    }
    removeEmptyAtRules(root)
    return root.toString().trim()
  }
  catch {
    return css
  }
}

function containsCssAfterMinify(baseCss: string, css: string) {
  if (baseCss.includes(css)) {
    return true
  }
  const normalizedBaseCss = normalizeCssForContainment(baseCss)
  const normalizedCss = normalizeCssForContainment(css)
  if (normalizedCss.length > 0 && normalizedBaseCss.includes(normalizedCss)) {
    return true
  }
  const normalizedNodes = collectNormalizedCssNodes(css)
  if (normalizedNodes.length > 0 && normalizedNodes.every(node => normalizedBaseCss.includes(node))) {
    return true
  }
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  const ruleKeys = collectCssRuleContentKeys(css)
  return ruleKeys.size > 0
    && [...ruleKeys].every(key => baseRuleKeys.has(key))
}

function removeTailwindSourceMediaWrappers(css: string) {
  if (!css.includes('@media source(')) {
    return css
  }
  try {
    const root = postcss.parse(css)
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
    root.walkAtRules((atRule) => {
      if (atRule.nodes && atRule.nodes.length === 0) {
        atRule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
      .replace(/@media\s+source\([^)]*\)\s*\{\s*\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\/?\s*\}/gi, '')
      .replace(/@media\s+source\([^)]*\)\s*\{\s*\}/gi, '')
  }
}

function removeTailwindEntryDirectivesFromCss(css: string) {
  return removeTailwindSourceDirectives(removeTailwindSourceMediaWrappers(css))
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
  const cleanRequest = request.replace(/[?#].*$/, '')
  if (cleanRequest.startsWith('/')) {
    return normalizeOutputPathKey(cleanRequest.slice(1))
  }
  const targetDir = path.posix.dirname(normalizeOutputPathKey(targetFile))
  return normalizeOutputPathKey(path.posix.join(targetDir === '.' ? '' : targetDir, cleanRequest))
}

function collectImportedStyleFiles(css: string, targetFile: string) {
  const imports = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      const importedFile = resolveImportedStyleFile(targetFile, parseImportRequest(atRule.params))
      if (importedFile) {
        imports.add(importedFile)
      }
    })
  }
  catch {
  }
  return imports
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

function shouldInjectViteProcessedCssResult(
  opts: InternalUserDefinedOptions,
  targetFile: string,
  sourceFile: string,
  options: {
    injectIntoMain?: boolean | undefined
  },
) {
  if (options.injectIntoMain === true) {
    return true
  }
  if (options.injectIntoMain === false) {
    return false
  }
  const targetFileKey = normalizeOutputPathKey(targetFile)
  const sourceFileKey = normalizeOutputPathKey(sourceFile)
  const sourceBaseName = sourceFileKey.replace(/\.(?:css|wxss|acss|ttss|qss|jxss|tyss)$/i, '').split('/').pop()
  return sourceFileKey !== targetFileKey
    && (
      opts.mainCssChunkMatcher(sourceFile, opts.appType)
      || sourceBaseName === 'app'
      || sourceBaseName === 'main'
    )
}

export function collectViteProcessedCssAssetResults(
  bundle: OutputBundle,
  options: CollectViteProcessedCssAssetOptions,
) {
  let collected = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (!isCssOutputFile(file) || !options.isViteProcessedCssAsset?.(output, file)) {
      continue
    }
    const rawSource = readAssetSource(output)
    const nextCss = resolveViteProcessedCssAssetSource(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )
    if (nextCss !== rawSource) {
      output.source = nextCss
    }
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    const resolvedOutputFile = options.resolveViteProcessedCssOutputFile?.(file) ?? file
    const shouldReplayIntoMainCss = options.opts != null
      && normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(file)
      && options.opts.mainCssChunkMatcher(resolvedOutputFile, options.opts.appType)
    options.recordViteProcessedCssAssetResult?.(file, nextCss, {
      injectIntoMain: shouldReplayIntoMainCss || undefined,
    })
    options.debug?.('collect vite-processed css asset: %s bytes=%d', file, nextCss.length)
    collected++
  }
  return collected
}

export function injectViteProcessedCssIntoMainCssAssets(
  bundle: OutputBundle,
  options: InjectViteProcessedCssAssetOptions,
) {
  const viteCssResults = [...(options.getViteProcessedCssAssetResults?.() ?? [])]
    .map(([file, record]) => {
      return typeof record === 'string'
        ? { file, css: record, injectIntoMain: undefined }
        : { file, css: record.css, injectIntoMain: record.injectIntoMain }
    })
    .filter(record => record.css.length > 0)
  if (viteCssResults.length === 0) {
    return 0
  }

  let injected = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !options.opts.cssMatcher(file)
      || !options.opts.mainCssChunkMatcher(file, options.opts.appType)
    ) {
      continue
    }
    const mainFileKey = normalizeOutputPathKey(file)
    const originalSource = readAssetSource(output)
    let nextCss = removeTailwindEntryDirectivesFromCss(originalSource)
    const importedStyleFiles = collectImportedStyleFiles(nextCss, file)
    for (const record of viteCssResults) {
      if (!shouldInjectViteProcessedCssResult(options.opts, mainFileKey, record.file, record)) {
        continue
      }
      if (importedStyleFiles.has(normalizeOutputPathKey(record.file))) {
        continue
      }
      let css = stripBundlerGeneratedCssMarkers(record.css).trim()
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
      if (containsCssAfterMinify(nextCss, css)) {
        continue
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
      if (missingCss.length === 0 || containsCssAfterMinify(nextCss, missingCss)) {
        continue
      }
      nextCss = appendCss(nextCss, missingCss)
    }
    if (nextCss === originalSource) {
      continue
    }
    output.source = nextCss
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, originalSource, nextCss)
    options.debug?.('inject vite-processed css into main css asset: %s bytes=%d', file, nextCss.length)
    injected++
  }
  return injected
}
