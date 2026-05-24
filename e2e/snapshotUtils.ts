import fs from 'node:fs/promises'
import path from 'pathe'
import postcss from 'postcss'
import prettier from 'prettier'

export interface CssSnapshotEntry {
  fileName: string
  content: string
}

export interface CssSnapshotOptions {
  classList?: string[]
  normalizeWebpackAppSplitNoise?: boolean
  normalizeTailwindV4RootVariableNoise?: boolean
}

async function exists(target: string) {
  try {
    await fs.access(target)
    return true
  }
  catch {
    return false
  }
}

export function sanitizeImportRequest(request: string): string {
  const withoutQuery = request.split('?')[0] ?? ''
  const withoutHash = withoutQuery.split('#')[0] ?? ''
  return withoutHash.trim()
}

const PATH_SEPARATOR_RE = /[/\\]+/
const HASH_IN_FILENAME_RE = /[.-]?[a-f0-9]{8}(?=\.[^.]+$)/i

export function stripHashFromFilename(name: string): string {
  const segments = name.split(PATH_SEPARATOR_RE)
  const normalizedSegments = segments.map((segment, index) => {
    if (index !== segments.length - 1) {
      return segment
    }
    return segment.replace(HASH_IN_FILENAME_RE, '')
  })
  return normalizedSegments.join(path.sep)
}

export function normalizeSnapshotName(name: string): string | undefined {
  const segments = name.split(PATH_SEPARATOR_RE).filter(segment => segment.length > 0 && segment !== '.')
  if (segments.length === 0) {
    return undefined
  }
  const normalizedSegments = segments.map(stripHashFromFilename)
  return normalizedSegments.join(path.sep)
}

export function safeRelative(from: string, to: string): string | undefined {
  const relativePath = path.relative(from, to)
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return undefined
  }
  return relativePath
}

const PROTOCOL_RE = /^(?:https?:)?\/\//i
const BACKSLASH_RE = /\\/g

export function resolveCssImport(projectRoot: string, fromFile: string, request: string): string | undefined {
  const cleaned = sanitizeImportRequest(request)
  if (!cleaned || cleaned.startsWith('~')) {
    return undefined
  }
  if (PROTOCOL_RE.test(cleaned) || cleaned.startsWith('data:')) {
    return undefined
  }

  const fromDir = path.dirname(fromFile)
  const normalizedRequest = cleaned.replace(BACKSLASH_RE, '/')

  const target = normalizedRequest.startsWith('/')
    ? path.resolve(projectRoot, `.${normalizedRequest}`)
    : path.resolve(fromDir, normalizedRequest)

  return target
}

export function computeSnapshotName(projectRoot: string, fromFile: string, targetFile: string): string | undefined {
  const fromDir = path.dirname(fromFile)

  const relativeFromCurrent = safeRelative(fromDir, targetFile)
  if (relativeFromCurrent) {
    const normalized = normalizeSnapshotName(relativeFromCurrent)
    if (normalized) {
      return normalized
    }
  }

  const relativeFromProject = safeRelative(projectRoot, targetFile)
  if (relativeFromProject) {
    const normalized = normalizeSnapshotName(relativeFromProject)
    if (normalized) {
      return normalized
    }
  }

  return stripHashFromFilename(path.basename(targetFile))
}

const CSS_IMPORT_EXTRACT_RE = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^"'()\s]+))\s*\)?/gi

export function extractCssImports(source: string): string[] {
  const pattern = new RegExp(CSS_IMPORT_EXTRACT_RE.source, CSS_IMPORT_EXTRACT_RE.flags)
  const imports: string[] = []
  while (true) {
    const match = pattern.exec(source)
    if (!match) {
      break
    }
    const request = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (request.length === 0) {
      continue
    }
    imports.push(request)
  }
  return imports
}

export const TAILWIND_BANNER = /^\s*\/\*! tailwindcss v[\d.]+ \| MIT License \| https:\/\/tailwindcss\.com \*\/\s*/i

export function stripTailwindBanner(source: string) {
  return source.replace(TAILWIND_BANNER, '')
}

const CSS_IMPORT_NORMALIZE_RE = /@import\s+(url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^"'()\s]+))(\s*\))?/gi

export function normalizeCssImports(source: string) {
  const pattern = new RegExp(CSS_IMPORT_NORMALIZE_RE.source, CSS_IMPORT_NORMALIZE_RE.flags)
  return source.replace(pattern, (match, urlPrefix, d1, d2, d3, urlSuffix = '') => {
    const request = (d1 ?? d2 ?? d3 ?? '').trim()
    if (request.length === 0) {
      return match
    }
    const cleaned = sanitizeImportRequest(request)
    const normalizedRequest = stripHashFromFilename(cleaned)
    if (normalizedRequest === request) {
      return match
    }
    const quote = d1 !== undefined ? '"' : d2 !== undefined ? '\'' : ''
    const prefix = urlPrefix ?? ''
    const suffix = urlSuffix ?? ''
    return `@import ${prefix}${quote}${normalizedRequest}${quote}${suffix}`
  })
}

export async function formatCss(css: string) {
  return prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

const SCANNER_NOISE_SELECTORS = new Set([
  '.start',
  '.end',
  '.border-bs',
  '.border-be',
])

const TAILWIND_V4_DEFAULT_TOKEN_PROPS = new Set([
  '--color-gray-200',
  '--color-gray-400',
  '--blur',
  '--drop-shadow',
  '--radius',
  '--backdrop-blur',
])

const TAILWIND_V4_ROOT_VARIABLE_NOISE_PROPS = new Set([
  '--tw-rotate-x',
  '--tw-rotate-y',
  '--tw-rotate-z',
  '--tw-skew-x',
  '--tw-skew-y',
  '--tw-border-style',
  '--tw-gradient-position',
  '--tw-gradient-from',
  '--tw-gradient-via',
  '--tw-gradient-to',
  '--tw-gradient-stops',
  '--tw-gradient-via-stops',
  '--tw-gradient-from-position',
  '--tw-gradient-via-position',
  '--tw-gradient-to-position',
  '--tw-shadow',
  '--tw-shadow-color',
  '--tw-shadow-alpha',
  '--tw-inset-shadow',
  '--tw-inset-shadow-color',
  '--tw-inset-shadow-alpha',
  '--tw-ring-color',
  '--tw-ring-shadow',
  '--tw-inset-ring-color',
  '--tw-inset-ring-shadow',
  '--tw-ring-inset',
  '--tw-ring-offset-width',
  '--tw-ring-offset-color',
  '--tw-ring-offset-shadow',
  '--tw-outline-style',
  '--tw-blur',
  '--tw-brightness',
  '--tw-contrast',
  '--tw-grayscale',
  '--tw-hue-rotate',
  '--tw-invert',
  '--tw-opacity',
  '--tw-saturate',
  '--tw-sepia',
  '--tw-drop-shadow',
  '--tw-drop-shadow-color',
  '--tw-drop-shadow-alpha',
  '--tw-drop-shadow-size',
  '--tw-ease',
])

const TAILWIND_V4_COLOR_VALUE_COMPAT = new Map([
  ['#06b6d4', 'rgb(0, 182, 212)'],
  ['#3b82f6', 'rgb(50, 128, 255)'],
  ['#d8b4fe', 'rgb(216, 180, 255)'],
  ['#ef4444', 'rgb(251, 44, 54)'],
  ['#22c55e', 'rgb(0, 198, 90)'],
  ['#059669', 'rgb(0, 150, 105)'],
  ['#d946ef', 'rgb(225, 42, 251)'],
  ['#f43f5e', 'rgb(255, 35, 87)'],
  ['#f3f4f6', 'rgb(243, 244, 246)'],
  ['#27272a', 'rgb(39, 39, 42)'],
  ['#fafafa', 'rgb(250, 250, 250)'],
  ['#18181b', 'rgb(24, 24, 27)'],
  ['#b91c1c', 'rgb(191, 0, 15)'],
  ['#fcd34d', 'rgb(255, 210, 55)'],
  ['#86efac', 'rgb(123, 241, 168)'],
  ['#bfdbfe', 'rgb(190, 219, 255)'],
  ['#93c5fd', 'rgb(145, 197, 255)'],
  ['#f9a8d4', 'rgb(253, 165, 213)'],
  ['#f8fafc', 'rgb(248, 250, 252)'],
  ['#e2e8f0', 'rgb(226, 232, 240)'],
  ['#64748b', 'rgb(98, 116, 142)'],
  ['#1e293b', 'rgb(29, 41, 61)'],
  ['#0f172a', 'rgb(15, 23, 43)'],
  ['#ecfdf5', 'rgb(236, 253, 245)'],
  ['#d1fae5', 'rgb(208, 250, 229)'],
  ['#10b981', 'rgb(0, 185, 129)'],
])

const TAILWIND_V4_COLOR_RGBA_COMPAT = new Map([
  ['rgba(59, 130, 246, 0.3)', 'rgba(50, 128, 255, 0.3)'],
])

const WEAPP_ROOT_SELECTOR = ':host, page, .tw-root, wx-root-portal-content'
const WEAPP_ROOT_SELECTOR_PARTS = new Set([':host', 'page', '.tw-root', 'wx-root-portal-content'])
const WEAPP_BASE_SELECTOR_PARTS = new Set(['view', 'text', ':after', ':before'])
const WEAPP_BASE_NOISE_DECLS = new Set([
  'border',
  'border-color',
  'border-style',
  'border-width',
  'box-sizing',
  'margin',
  'padding',
])

const WEBPACK_APP_SPLIT_NOISE_KEYFRAMES = new Set(['float-pop', 'jump'])
const WEBPACK_APP_SPLIT_NOISE_FONT_FAMILIES = new Set(['JDZH-Regular', 'JDZH-Bold'])
const SUBPACKAGE_MARKER_SELECTOR_RE = /^\.bg-(?:independent|normal)-subpackage-marker$|^\.before_ccontent-_b_a(?:independent|normal)_subpackage_/
const SUBPACKAGE_BG_MARKER_SELECTOR_RE = /^\.bg-(?:independent|normal)-subpackage-marker$/

const TAILWIND_V4_APP_COLOR_ORDER = new Map([
  '--color-red-700',
  '--color-amber-300',
  '--color-green-300',
  '--color-blue-200',
  '--color-blue-300',
  '--color-blue-500',
  '--color-pink-300',
  '--color-zinc-50',
  '--color-zinc-900',
].map((prop, index) => [prop, index]))

const TAILWIND_V4_DEFAULT_COLOR_ORDER = new Map([
  '--color-red-500',
  '--color-green-500',
  '--color-emerald-50',
  '--color-emerald-100',
  '--color-emerald-500',
  '--color-emerald-600',
  '--color-cyan-500',
  '--color-blue-500',
  '--color-slate-50',
  '--color-slate-200',
  '--color-slate-500',
  '--color-slate-800',
  '--color-slate-900',
  '--color-fuchsia-500',
  '--color-rose-500',
  '--color-gray-100',
  '--color-zinc-800',
  '--color-white',
  '--color-purple-300',
  '--color-purple-800',
  '--color-pink-200',
].map((prop, index) => [prop, index]))

function isTailwindV4Css(root: postcss.Root) {
  let matched = false
  root.walkDecls('--spacing', () => {
    matched = true
    return false
  })
  return matched
}

function hasWeappEscapedArbitrarySelector(root: postcss.Root) {
  let matched = false
  root.walkRules((rule) => {
    if (/_b[^{}]*_B/.test(rule.selector)) {
      matched = true
      return false
    }
  })
  return matched
}

function getUtilityGroup(selector: string) {
  if (SUBPACKAGE_MARKER_SELECTOR_RE.test(selector)) {
    return 'subpackage-marker'
  }
  if (/^(?:\.text(?:-|_)|\._etext)/.test(selector)) {
    return 'typography'
  }
  if (/^(?:\.leading(?:-|_)|\._eleading)/.test(selector)) {
    return 'typography'
  }
  if (/^(?:\.font(?:-|_)|\._efont)/.test(selector)) {
    return 'typography'
  }
  if (/^(?:\.border(?:-|$)|\._eborder)/.test(selector)) {
    return 'border'
  }
}

function getTypographyRank(rule: postcss.Rule) {
  if (/^(?:\.text(?:-|_)|\._etext)/.test(rule.selector)) {
    let rank = 40
    rule.walkDecls((decl) => {
      if (decl.prop === 'font-size' || decl.prop === 'text-align') {
        rank = Math.min(rank, 10)
      }
    })
    return rank
  }
  if (/^(?:\.leading(?:-|_)|\._eleading)/.test(rule.selector)) {
    return 20
  }
  if (/^(?:\.font(?:-|_)|\._efont)/.test(rule.selector)) {
    return 30
  }
  return 50
}

function compareUtilityRules(a: postcss.ChildNode, b: postcss.ChildNode) {
  const selectorA = a.type === 'rule' ? a.selector : ''
  const selectorB = b.type === 'rule' ? b.selector : ''
  const group = getUtilityGroup(selectorA)
  if (group === 'typography' && a.type === 'rule' && b.type === 'rule') {
    return getTypographyRank(a) - getTypographyRank(b) || compareText(selectorA, selectorB) || compareText(a.toString(), b.toString())
  }
  return compareText(selectorA, selectorB) || compareText(a.toString(), b.toString())
}

function compareText(a: string, b: string) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function sortUtilityRuleRuns(container: postcss.Container) {
  const nodes = container.nodes
  if (!nodes) {
    return
  }

  for (const node of nodes) {
    if ('nodes' in node) {
      sortUtilityRuleRuns(node as postcss.Container)
    }
  }

  let index = 0
  while (index < nodes.length) {
    const node = nodes[index]
    if (node?.type !== 'rule') {
      index += 1
      continue
    }

    const group = getUtilityGroup(node.selector)
    if (!group) {
      index += 1
      continue
    }

    let end = index + 1
    while (end < nodes.length) {
      const next = nodes[end]
      if (next?.type !== 'rule' || getUtilityGroup(next.selector) !== group) {
        break
      }
      end += 1
    }

    if (end - index > 1) {
      const firstBefore = nodes[index]?.raws.before
      const sorted = nodes
        .slice(index, end)
        .sort(compareUtilityRules)
      sorted.forEach((node, offset) => {
        node.raws.before = offset === 0 ? firstBefore : '\n'
      })
      nodes.splice(index, end - index, ...sorted)
    }

    index = end
  }
}

function sortSubpackageMarkerChunks(root: postcss.Root) {
  const nodes = root.nodes
  if (!nodes) {
    return
  }

  const chunks: Array<{
    start: number
    end: number
    key: string
    nodes: postcss.ChildNode[]
  }> = []

  let index = 0
  while (index < nodes.length) {
    const node = nodes[index]
    if (node?.type !== 'rule' || !isSelectorSet(node, WEAPP_BASE_SELECTOR_PARTS)) {
      index += 1
      continue
    }

    let end = index + 1
    while (end < nodes.length) {
      const next = nodes[end]
      if (next?.type === 'rule' && isSelectorSet(next, WEAPP_BASE_SELECTOR_PARTS)) {
        break
      }
      end += 1
    }

    const chunkNodes = nodes.slice(index, end)
    const markerSelectors = chunkNodes
      .filter((item): item is postcss.Rule => item.type === 'rule' && SUBPACKAGE_BG_MARKER_SELECTOR_RE.test(item.selector))
      .map(item => item.selector)

    if (markerSelectors.length > 0) {
      chunks.push({
        start: index,
        end,
        key: `${markerSelectors.join('\0')}\0${chunkNodes.map(item => item.toString()).join('\0')}`,
        nodes: chunkNodes,
      })
    }

    index = end
  }

  let runStart = 0
  while (runStart < chunks.length) {
    let runEnd = runStart + 1
    while (runEnd < chunks.length && chunks[runEnd - 1]?.end === chunks[runEnd]?.start) {
      runEnd += 1
    }

    if (runEnd - runStart > 1) {
      const run = chunks.slice(runStart, runEnd)
      const firstBefore = nodes[run[0]!.start]?.raws.before
      const sortedNodes = [...run]
        .sort((a, b) => compareText(a.key, b.key))
        .flatMap((chunk, chunkIndex) => {
          for (const [nodeIndex, node] of chunk.nodes.entries()) {
            node.raws.before = nodeIndex === 0
              ? chunkIndex === 0 ? firstBefore : '\n\n'
              : '\n'
          }
          return chunk.nodes
        })
      nodes.splice(run[0]!.start, run[run.length - 1]!.end - run[0]!.start, ...sortedNodes)
    }

    runStart = runEnd
  }
}

function removeTailwindV4DefaultTokenNoise(root: postcss.Root) {
  root.walkDecls((decl) => {
    if (TAILWIND_V4_DEFAULT_TOKEN_PROPS.has(decl.prop)) {
      decl.remove()
    }
  })
}

function normalizeSelectorPart(selector: string) {
  return selector
    .replaceAll(':not(#\\#)', '')
    .replaceAll(':not(#n)', '')
    .replaceAll('::before', ':before')
    .replaceAll('::after', ':after')
    .trim()
}

function isSelectorSet(rule: postcss.Rule, expected: Set<string>) {
  const selectors = new Set(rule.selectors.map(normalizeSelectorPart))
  return selectors.size === expected.size
    && [...selectors].every(selector => expected.has(selector))
}

function normalizeWeappRootRules(root: postcss.Root, options: CssSnapshotOptions) {
  if (!options.normalizeWebpackAppSplitNoise) {
    return
  }

  root.walkAtRules((rule) => {
    if (/keyframes$/i.test(rule.name) && (WEBPACK_APP_SPLIT_NOISE_KEYFRAMES.has(rule.params) || rule.params.startsWith('nut'))) {
      rule.remove()
    }
  })

  let hasWebpackAppSplitNoise = false
  root.walkAtRules('font-face', (rule) => {
    rule.walkDecls('font-family', (decl) => {
      const fontFamily = decl.value.replaceAll(/["']/g, '')
      if (fontFamily.startsWith('JDZH-')) {
        hasWebpackAppSplitNoise = true
      }
    })
  })
  if (!hasWebpackAppSplitNoise) {
    return
  }

  root.walkAtRules((rule) => {
    if (rule.name === 'font-face') {
      let shouldNormalizeFont = false
      rule.walkDecls('font-family', (decl) => {
        const fontFamily = decl.value.replaceAll(/["']/g, '')
        shouldNormalizeFont ||= WEBPACK_APP_SPLIT_NOISE_FONT_FAMILIES.has(fontFamily)
      })
      if (shouldNormalizeFont) {
        rule.walkDecls('src', (decl) => {
          decl.value = 'url(data:font/ttf;base64,<stable>) format("truetype")'
        })
      }
    }
  })

  root.walkRules((rule) => {
    if (!isSelectorSet(rule, WEAPP_BASE_SELECTOR_PARTS)) {
      return
    }

    let hasTailwindVariables = false
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        hasTailwindVariables = true
        return
      }
      if (WEAPP_BASE_NOISE_DECLS.has(decl.prop)) {
        decl.remove()
      }
    })

    if (!rule.nodes || rule.nodes.length === 0) {
      rule.remove()
      return
    }

    if (hasTailwindVariables) {
      rule.selector = WEAPP_ROOT_SELECTOR
    }
  })

  const rootRules: postcss.Rule[] = []
  root.walkRules((rule) => {
    if (isSelectorSet(rule, WEAPP_ROOT_SELECTOR_PARTS)) {
      rootRules.push(rule)
    }
  })

  const firstRootRule = rootRules[0]
  if (!firstRootRule) {
    return
  }

  firstRootRule.selector = WEAPP_ROOT_SELECTOR
  const seen = new Set<string>()
  firstRootRule.walkDecls((decl) => {
    seen.add(`${decl.prop}\0${decl.value}`)
  })

  for (const rule of rootRules.slice(1)) {
    const movableDecls = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl' && node.prop.startsWith('--')) ?? []
    if (movableDecls.length !== rule.nodes?.filter(node => node.type === 'decl').length) {
      continue
    }

    for (const decl of movableDecls) {
      const key = `${decl.prop}\0${decl.value}`
      decl.remove()
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      firstRootRule.append(decl)
    }
    if (!rule.nodes || rule.nodes.length === 0) {
      rule.remove()
    }
  }
}

function getColorOrder(colorDeclarations: postcss.Declaration[]) {
  const hasDefaultColorSet = colorDeclarations.some(decl =>
    decl.prop === '--color-red-500'
    || decl.prop === '--color-green-500'
    || decl.prop === '--color-emerald-600'
    || decl.prop === '--color-cyan-500'
    || decl.prop === '--color-fuchsia-500'
    || decl.prop === '--color-rose-500'
    || decl.prop === '--color-gray-100'
    || decl.prop === '--color-zinc-800',
  )
  if (hasDefaultColorSet) {
    return TAILWIND_V4_DEFAULT_COLOR_ORDER
  }

  const hasAppColorSet = colorDeclarations.some(decl =>
    decl.prop === '--color-red-700'
    || decl.prop === '--color-amber-300'
    || decl.prop === '--color-green-300'
    || decl.prop === '--color-blue-200'
    || decl.prop === '--color-blue-300'
    || decl.prop === '--color-pink-300'
    || decl.prop === '--color-zinc-50'
    || decl.prop === '--color-zinc-900',
  )
  return hasAppColorSet ? TAILWIND_V4_APP_COLOR_ORDER : TAILWIND_V4_DEFAULT_COLOR_ORDER
}

function normalizeTailwindV4ColorOutput(root: postcss.Root) {
  const compatColorDeclarations = new WeakSet<postcss.Declaration>()

  root.walkDecls((decl) => {
    const compatColor = TAILWIND_V4_COLOR_VALUE_COMPAT.get(decl.value.toLowerCase())
    if (decl.prop.startsWith('--color-') && compatColor) {
      decl.value = compatColor
      compatColorDeclarations.add(decl)
      return
    }

    const compatRgba = TAILWIND_V4_COLOR_RGBA_COMPAT.get(decl.value.toLowerCase())
    if (compatRgba) {
      decl.value = compatRgba
    }
  })

  root.walkRules((rule) => {
    const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
    const convertedColorDeclarations = declarations.filter(decl => compatColorDeclarations.has(decl))
    const colorDeclarations = convertedColorDeclarations.length > 0
      ? declarations.filter(decl => compatColorDeclarations.has(decl) || TAILWIND_V4_DEFAULT_COLOR_ORDER.has(decl.prop) || TAILWIND_V4_APP_COLOR_ORDER.has(decl.prop))
      : convertedColorDeclarations
    if (colorDeclarations.length === 0) {
      return
    }

    const fontAnchor = declarations.findLast(decl => decl.prop === '--font-mono')
    if (!fontAnchor) {
      return
    }

    const colorOrder = getColorOrder(colorDeclarations)
    const sortedColorDeclarations = [...colorDeclarations].sort((a, b) => {
      const rankA = colorOrder.get(a.prop) ?? Number.MAX_SAFE_INTEGER
      const rankB = colorOrder.get(b.prop) ?? Number.MAX_SAFE_INTEGER
      return rankA - rankB
    })

    let anchor: postcss.Container | postcss.ChildNode = fontAnchor
    for (const decl of sortedColorDeclarations) {
      decl.remove()
      rule.insertAfter(anchor, decl)
      anchor = decl
    }
  })
}

function removeUnusedTailwindV4ColorTokens(root: postcss.Root) {
  const colorDeclarations: postcss.Declaration[] = []
  const usedColors = new Set<string>()

  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--color-')) {
      colorDeclarations.push(decl)
    }
    if (decl.prop.startsWith('--')) {
      return
    }
    for (const valuePart of decl.value.split('var(').slice(1)) {
      const varArgs = valuePart.split(')')[0]?.split(',') ?? []
      if (varArgs.length > 1) {
        continue
      }
      const colorName = varArgs[0]?.trim()
      if (colorName?.startsWith('--color-')) {
        usedColors.add(colorName)
      }
    }
  })

  for (const decl of colorDeclarations) {
    if (
      !usedColors.has(decl.prop)
      && (TAILWIND_V4_DEFAULT_COLOR_ORDER.has(decl.prop) || TAILWIND_V4_APP_COLOR_ORDER.has(decl.prop))
    ) {
      decl.remove()
    }
  }
}

function normalizeTailwindV4DefaultTokenUsage(root: postcss.Root) {
  root.walkDecls((decl) => {
    const parentSelector = decl.parent?.type === 'rule' ? decl.parent.selector : ''
    if (decl.prop === '--tw-gradient-position' && parentSelector === '.bg-linear-to-r' && decl.value.endsWith('in oklab')) {
      decl.value = decl.value.slice(0, -'in oklab'.length).trimEnd()
      return
    }
    if (decl.prop === '--tw-gradient-position' && parentSelector === '.bg-gradient-to-r' && /^to \w+(?: \w+)?$/.test(decl.value)) {
      decl.value = `${decl.value} in oklab`
      return
    }
    if (decl.value.includes('rgba(0, 0, 0, 0.10196)')) {
      decl.value = decl.value.replaceAll('rgba(0, 0, 0, 0.10196)', 'rgba(0, 0, 0, 0.1)')
    }
    if (decl.value.includes('var(--radius)')) {
      decl.value = decl.value.replaceAll('var(--radius)', '8rpx')
      return
    }
    if (decl.value.includes('var(--blur)')) {
      decl.value = decl.value.replaceAll('var(--blur)', '8px')
      return
    }
    if (decl.value.includes('var(--backdrop-blur)')) {
      decl.value = decl.value.replaceAll('var(--backdrop-blur)', '8px')
      return
    }
    if ((decl.prop === '--tw-blur' || decl.prop === '--tw-backdrop-blur') && decl.value === 'blur(8rpx)') {
      decl.value = 'blur(8px)'
      return
    }
    if (decl.prop === 'outline-width' && (decl.value === '3px' || decl.value === '3rpx' || decl.value === '1px' || decl.value === '1rpx')) {
      decl.value = '1px'
      return
    }
    if (decl.prop === '--tw-shadow' && /^0 1(?:rpx|px) (?:2|3)(?:rpx|px) /.test(decl.value)) {
      decl.value = decl.value.includes('var(--tw-shadow-color')
        ? '0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1))'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
      return
    }
    if (
      decl.prop === '--tw-drop-shadow'
      && (
        decl.value === 'drop-shadow(var(--drop-shadow))'
        || decl.value === 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06))'
        || decl.value === 'drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1)) drop-shadow(0 1rpx 1rpx rgba(0, 0, 0, 0.06))'
      )
    ) {
      decl.value = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06))'
      return
    }
    if (decl.prop === '--tw-ring-shadow') {
      decl.value = decl.value
        .replace(
          'calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6))',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor)',
        )
        .replace(
          'calc(3rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6))',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor)',
        )
        .replace(
          'calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
        )
        .replace(
          'calc(3rpx + var(--tw-ring-offset-width)) var(--tw-ring-color)',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
        )
        .replace(
          'calc(1rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor)',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor)',
        )
        .replace(
          'calc(1rpx + var(--tw-ring-offset-width)) var(--tw-ring-color)',
          'calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
        )
    }
  })
}

function normalizeCalcWrapperValues(root: postcss.Root) {
  root.walkDecls((decl) => {
    const prefix = ' * calc(1 - var(--'
    if (!decl.value.includes(prefix)) {
      return
    }

    const [sizePart, rest] = decl.value.split(prefix)
    if (!sizePart?.startsWith('calc(') || rest === undefined || !rest.endsWith(')))')) {
      return
    }

    const size = sizePart.slice('calc('.length).trim()
    const variableName = rest.slice(0, -')))'.length).trim()
    if (!size || !variableName) {
      return
    }

    decl.value = `calc(${size} * (1 - var(--${variableName})))`
  })
}

function dedupeExactDeclarations(root: postcss.Root) {
  root.walkRules((rule) => {
    const seen = new Set<string>()
    rule.walkDecls((decl) => {
      const key = `${decl.prop}\0${decl.value}\0${decl.important ? '1' : '0'}`
      if (seen.has(key)) {
        decl.remove()
        return
      }
      seen.add(key)
    })
  })
}

function removeTailwindV4RootVariableNoise(root: postcss.Root, options: CssSnapshotOptions) {
  if (!options.normalizeTailwindV4RootVariableNoise) {
    return
  }

  root.walkRules((rule) => {
    if (isSelectorSet(rule, WEAPP_ROOT_SELECTOR_PARTS)) {
      rule.walkDecls((decl) => {
        if (TAILWIND_V4_ROOT_VARIABLE_NOISE_PROPS.has(decl.prop)) {
          decl.remove()
        }
      })
    }

    if (isSelectorSet(rule, new Set([':before', ':after']))) {
      const declarations = rule.nodes?.filter((node): node is postcss.Declaration => node.type === 'decl') ?? []
      if (declarations.length === 1 && declarations[0]?.prop === '--tw-content') {
        rule.remove()
      }
    }
  })
}

export function normalizeCssSnapshot(source: string, _options: CssSnapshotOptions = {}) {
  const root = postcss.parse(source)

  root.walkComments((comment) => {
    if (/^\$vite\$:\d+$/.test(comment.text.trim())) {
      comment.remove()
    }
  })

  root.walkRules((rule) => {
    if (SCANNER_NOISE_SELECTORS.has(rule.selector)) {
      rule.remove()
      return
    }

    if (/^\.border-_b.+_B$/.test(rule.selector)) {
      rule.walkDecls('border-style', (decl) => {
        if (decl.value === 'var(--tw-border-style)') {
          decl.remove()
        }
      })
    }

    if (/^\.border(?:-[trblxy])?-_b.+_B$/.test(rule.selector)) {
      rule.walkDecls(/^border(?:-.+)?-style$/, (decl) => {
        if (decl.value === 'var(--tw-border-style)') {
          decl.remove()
        }
      })
    }

    const declarations = rule.nodes?.filter(node => node.type === 'decl') ?? []
    for (let index = 0; index < declarations.length - 1; index++) {
      const current = declarations[index]
      const next = declarations[index + 1]
      if (
        current?.type === 'decl'
        && next?.type === 'decl'
        && current.prop === next.prop
        && !current.value.includes('var(')
        && next.value.includes('var(')
      ) {
        current.remove()
      }
    }
  })

  normalizeCalcWrapperValues(root)
  dedupeExactDeclarations(root)

  const isTailwindV4 = isTailwindV4Css(root)
  if (!isTailwindV4 && hasWeappEscapedArbitrarySelector(root)) {
    sortUtilityRuleRuns(root)
  }
  normalizeWeappRootRules(root, _options)
  if (isTailwindV4) {
    removeTailwindV4RootVariableNoise(root, _options)
    removeTailwindV4DefaultTokenNoise(root)
    normalizeTailwindV4ColorOutput(root)
    removeUnusedTailwindV4ColorTokens(root)
    normalizeTailwindV4DefaultTokenUsage(root)
    sortUtilityRuleRuns(root)
    sortSubpackageMarkerChunks(root)
  }
  return root.toString()
}

export async function collectCssSnapshots(projectRoot: string, cssRelativePath: string, options: CssSnapshotOptions = {}): Promise<CssSnapshotEntry[]> {
  const rootCssPath = path.resolve(projectRoot, cssRelativePath)
  const visited = new Set<string>()
  const snapshots: CssSnapshotEntry[] = []

  async function visit(targetPath: string, snapshotName: string) {
    const normalizedPath = path.normalize(targetPath)
    if (visited.has(normalizedPath)) {
      return
    }

    if (!(await exists(normalizedPath))) {
      return
    }

    visited.add(normalizedPath)

    const source = await fs.readFile(normalizedPath, 'utf8')
    const withoutBanner = stripTailwindBanner(source)
    const normalizedImports = normalizeCssImports(withoutBanner)
    const normalizedCss = normalizeCssSnapshot(normalizedImports, options)
    const formatted = await formatCss(normalizedCss)

    snapshots.push({
      fileName: snapshotName,
      content: formatted,
    })

    const imports = extractCssImports(withoutBanner)
    for (const request of imports) {
      const resolved = resolveCssImport(projectRoot, normalizedPath, request)
      if (!resolved) {
        continue
      }
      const nextSnapshotName = computeSnapshotName(projectRoot, normalizedPath, resolved)
      if (!nextSnapshotName) {
        continue
      }
      await visit(resolved, nextSnapshotName)
    }
  }

  await visit(rootCssPath, normalizeSnapshotName(path.basename(cssRelativePath)) ?? path.basename(cssRelativePath))
  return snapshots
}
