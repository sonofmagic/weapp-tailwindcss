import type { AppsGeneratorCompareReportItem, CompareReportItem, CssSummary } from './apps-generator-report'
import type { DemoCoverageEntry } from './demoCoverageMatrix'
import type { ProjectEntry } from './shared'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import { createChineseMarkdownReport, createMarkdownReport } from './apps-generator-report'
import { DEMO_COVERAGE_MATRIX } from './demoCoverageMatrix'
import { E2E_PROJECTS } from './projectEntries'
import { clearProjectBuildState } from './projectTest'
import { collectCssSnapshots, resolveSnapshotFile, twPatch } from './shared'
import { normalizeCssTextSnapshot, normalizeSnapshotName } from './snapshotUtils'

interface CompareProject {
  name: string
  fixturesDir: '../demo'
  rootDir: string
  platform: string
  allowedPlatforms: string[]
  cssFile: string
  cssPath: string
  requiredCssFiles: string[]
}

interface CreateProjectReportOptions {
  onPassed?: (result: {
    generatorResult: GeneratorBuildResult
  }) => void | Promise<void>
}

interface GeneratorBuildResult {
  css: string
  cssFiles: string[]
  cssSnapshots: GeneratorCssSnapshot[]
}

interface GeneratorCssSnapshot {
  fileName: string
  content: string
}

const SUBPACKAGE_MARKER_PATTERNS = [
  /normal[-_]subpackage/i,
  /independent[-_]subpackage/i,
]
const SUBPACKAGE_ROOTS = ['sub-normal', 'sub-independent'] as const
const localHBuilderXProjectNames = new Set(
  DEMO_COVERAGE_MATRIX
    .filter(item => item.hbuilderxLocal)
    .map(item => item.name),
)

const MINI_PROGRAM_CSS_PATTERN = '**/*.{wx,ac,jx,tt,q,c,ty}ss'
const USER_IMPORTED_UI_CSS_MARKERS = [
  '.weapp-tw-user-ui-card',
  '.weapp-tw-user-ui-loading',
  '@keyframes weappTwUserUiRotation',
  '@keyframes weappTwUserUiBreathe',
] as const

function filterCompareProjects(projects: CompareProject[]) {
  const filter = process.env['E2E_PROJECT_FILTER']
  if (!filter) {
    return projects
  }

  const pattern = new RegExp(filter)
  return projects.filter(project => pattern.test(project.name))
}

const projects: CompareProject[] = filterCompareProjects([
  ...E2E_PROJECTS
    .filter(entry => !localHBuilderXProjectNames.has(entry.name))
    .map(entry => createCompareProject(entry, '../demo')),
])
const projectFilterEnabled = Boolean(process.env['E2E_PROJECT_FILTER'])

const UNSUPPORTED_LEGACY_SELECTOR_SET = new Set([
  ':after',
  ':before',
  '::after',
  '::before',
  ':-moz-focusring',
  ':-moz-ui-invalid',
  '::-webkit-calendar-picker-indicator',
  '::-webkit-date-and-time-value',
  '::-webkit-datetime-edit',
  '::-webkit-datetime-edit-day-field',
  '::-webkit-datetime-edit-fields-wrapper',
  '::-webkit-datetime-edit-hour-field',
  '::-webkit-datetime-edit-meridiem-field',
  '::-webkit-datetime-edit-millisecond-field',
  '::-webkit-datetime-edit-minute-field',
  '::-webkit-datetime-edit-month-field',
  '::-webkit-datetime-edit-second-field',
  '::-webkit-datetime-edit-year-field',
  '::-webkit-inner-spin-button',
  '::-webkit-input-placeholder',
  '::-webkit-outer-spin-button',
  '::-webkit-search-decoration',
  '::placeholder',
  '[hidden]:where(:not([hidden=\'until-found\']))',
  'a',
  'abbr:where([title])',
  'audio',
  'b',
  'button',
  'canvas',
  'code',
  'embed',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'html',
  'iframe',
  'img',
  'input',
  'input:where([type=\'button\'], [type=\'reset\'], [type=\'submit\'])',
  'kbd',
  'menu',
  'object',
  'ol',
  'optgroup',
  'pre',
  'progress',
  'samp',
  'select',
  'select[multiple] optgroup',
  'select[multiple] optgroup option',
  'select[size] optgroup',
  'select[size] optgroup option',
  'small',
  'strong',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'textarea',
  'ul',
  'video',
  'text',
  'view',
])

function compareText(a: string, b: string) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function normalizeSelector(selector: string) {
  return selector
    .replaceAll(':not(#\\#)', '')
    .replaceAll(':not(#n)', '')
    .replaceAll('::before', ':before')
    .replaceAll('::after', ':after')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectSelectors(css: string) {
  const selectors = new Set<string>()

  postcss.parse(css).walkRules((rule) => {
    for (const item of rule.selectors) {
      const selector = normalizeSelector(item)
      if (selector && !UNSUPPORTED_LEGACY_SELECTOR_SET.has(selector)) {
        selectors.add(selector)
      }
    }
  })

  return [...selectors].sort()
}

function isThemeSelector(selector: string) {
  return /(?:^|[\s.])(?:theme-dark|system-dark|dark)_c/.test(selector) || /(?:^|[\s.])theme-dark(?:[\s.:#]|$)/.test(selector)
}

function summarizeCss(css: string): CssSummary {
  const selectors = collectSelectors(css)
  const themeSelectors = selectors.filter(isThemeSelector)
  const selectorText = selectors.join('\n')
  const themeSelectorText = themeSelectors.join('\n')
  return {
    bytes: Buffer.byteLength(css),
    selectors,
    hasSupports: css.includes('@supports'),
    hasHoverPseudo: /:hover\b/.test(css),
    hasTailwindBanner: /tailwindcss v\d+\./.test(css),
    hasSystemDarkModeMedia: css.includes('@media (prefers-color-scheme: dark)'),
    hasManualDarkModeSelector: /\.theme-dark(?:\s|\.)/.test(selectorText) || /\.(?:theme-dark|dark)_c\S+\.theme-dark/.test(selectorText),
    hasUnsupportedThemeAttributeSelector: themeSelectors.some(selector => /\[[^\]]+\]/.test(selector)),
    hasUnsupportedThemeComplexSelector: /:(?:where|not)\(/.test(themeSelectorText),
    hasWeappEscapedArbitrarySelector: /_b[^{}]*_B/.test(css),
    hasRawArbitrarySelector: /\\\[|\\\]/.test(css),
  }
}

function createCompareProject(entry: ProjectEntry, fixturesDir: '../demo'): CompareProject {
  const coverageEntry = findCoverageEntry(entry.name)
  const outputCssPath = path.join(entry.projectPath, entry.cssFile)
  const rootPrefix = `${entry.name}${path.sep}`
  const cssPath = outputCssPath.startsWith(rootPrefix)
    ? outputCssPath.slice(rootPrefix.length)
    : entry.cssFile
  const requiredCssFiles = (entry.cssFiles ?? [entry.cssFile]).map((file) => {
    const outputFilePath = path.join(entry.projectPath, file)
    return outputFilePath.startsWith(rootPrefix)
      ? outputFilePath.slice(rootPrefix.length)
      : file
  })

  return {
    name: entry.name,
    fixturesDir,
    rootDir: entry.name,
    platform: resolveDefaultBuildPlatform(entry, coverageEntry),
    allowedPlatforms: coverageEntry.platforms.map(platform => platform.platform),
    cssFile: outputCssPath,
    cssPath,
    requiredCssFiles,
  }
}

function findCoverageEntry(name: string): DemoCoverageEntry {
  const entry = DEMO_COVERAGE_MATRIX.find(item => item.name === name)
  if (!entry) {
    throw new Error(`Missing demo coverage matrix entry for ${name}`)
  }
  return entry
}

function resolveDefaultBuildPlatform(project: ProjectEntry, entry: DemoCoverageEntry) {
  const outputPath = normalizeOutputCssFileName(path.join(project.projectPath, project.cssFile))
  const pathPlatform = resolveOutputPathPlatform(outputPath)
  if (pathPlatform) {
    return pathPlatform
  }

  const defaultPlatform = entry.platforms.find(platform => platform.buildScript === 'build')
  if (defaultPlatform) {
    return defaultPlatform.platform
  }

  const staticAutomatedPlatform = entry.platforms.find(platform => platform.staticCoverage === 'automated')
  if (staticAutomatedPlatform) {
    return staticAutomatedPlatform.platform
  }

  return entry.platforms[0]?.platform ?? 'unknown'
}

function resolveOutputPathPlatform(outputPath: string) {
  const segments = outputPath.split('/')
  for (const segment of segments) {
    if (/^(?:mp|quickapp|app)-/.test(segment) || segment === 'h5' || segment === 'h5:ssr' || segment === 'wx') {
      return segment
    }
  }
}

async function cleanProject(root: string) {
  await Promise.all([
    fs.rm(path.resolve(root, 'dist'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'unpackage'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'node_modules/.vite'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'node_modules/.cache/tailwindcss-patch'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'node_modules/.cache/weapp-tailwindcss'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'src/node_modules/.cache/tailwindcss-patch'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, 'src/node_modules/.cache/weapp-tailwindcss'), { recursive: true, force: true }),
    fs.rm(path.resolve(root, '.tw-patch/tailwindcss-target.json'), { force: true }),
    fs.rm(path.resolve(root, '.tw-patch/tw-class-list.json'), { force: true }),
  ])
  await clearProjectBuildState(root)
}

async function buildProject(project: CompareProject) {
  const projectBase = path.resolve(__dirname, project.fixturesDir)
  const root = path.resolve(projectBase, project.rootDir)
  const projectRoot = path.resolve(projectBase, project.rootDir)
  await cleanProject(root)
  await twPatch(root)

  await execa('pnpm', ['run', 'build'], {
    cwd: root,
    stdio: process.env.E2E_DEBUG_BUILD === '1' ? 'inherit' : 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      TARO_BUILD_STRICT: '1',
      UNI_BUILD_STRICT: '1',
      RUST_BACKTRACE: process.env.RUST_BACKTRACE ?? '1',
      npm_package_json: path.resolve(root, 'package.json'),
      INIT_CWD: root,
    },
  })

  const classList = await readBuildClassList(root)
  const snapshots = await collectOutputCssSnapshots(projectRoot, project.cssPath, classList)
  return {
    css: snapshots.map(snapshot => snapshot.content).join('\n'),
    cssFiles: snapshots.map(snapshot => snapshot.fileName),
    cssSnapshots: snapshots,
  }
}

async function readBuildClassList(root: string) {
  try {
    const source = await fs.readFile(path.resolve(root, '.tw-patch/tw-class-list.json'), 'utf8')
    const parsed = JSON.parse(source)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : undefined
  }
  catch (error: any) {
    if (error?.code === 'ENOENT' || error?.code === 'EPERM') {
      return undefined
    }
    throw error
  }
}

async function collectOutputCssSnapshots(projectRoot: string, cssPath: string, classList?: string[]) {
  const entrySnapshots = await collectCssSnapshots(projectRoot, cssPath, {
    classList,
    normalizeTailwindV4RootVariableNoise:
      projectRoot.endsWith(`${path.sep}taro-vite-react-tailwindcss-v4`)
      || projectRoot.endsWith(`${path.sep}taro-vite-vue3-tailwindcss-v4`),
  })
  const outputRoot = path.dirname(path.resolve(projectRoot, cssPath))
  const entryRelativePath = normalizeOutputCssFileName(path.relative(outputRoot, path.resolve(projectRoot, cssPath)))
  const allCssFiles = await fg(MINI_PROGRAM_CSS_PATTERN, {
    absolute: false,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const normalizedEntrySnapshots = entrySnapshots.map((snapshot, index): GeneratorCssSnapshot => ({
    ...snapshot,
    fileName: index === 0 ? entryRelativePath : normalizeOutputCssFileName(snapshot.fileName),
  }))
  const entryFileNames = new Set(normalizedEntrySnapshots.map(snapshot => normalizeCssSnapshotFileKey(snapshot.fileName)))
  const extraSnapshots = await Promise.all(
    allCssFiles
      .sort(compareCssOutputFile)
      .filter(file => !entryFileNames.has(normalizeCssSnapshotFileKey(file)))
      .map(async (file) => {
        const snapshots = await collectCssSnapshots(outputRoot, file, {
          classList,
          rootSnapshotName: normalizeOutputCssFileName(file),
          normalizeTailwindV4RootVariableNoise:
            projectRoot.endsWith(`${path.sep}taro-vite-react-tailwindcss-v4`)
            || projectRoot.endsWith(`${path.sep}taro-vite-vue3-tailwindcss-v4`),
        })
        return snapshots.map((snapshot, index): GeneratorCssSnapshot => ({
          ...snapshot,
          fileName: index === 0
            ? normalizeOutputCssFileName(file)
            : normalizeOutputCssFileName(snapshot.fileName),
        }))
      }),
  )

  return [
    ...normalizedEntrySnapshots,
    ...extraSnapshots.flat().sort(compareCssSnapshotEntry),
  ].filter(snapshot => snapshot.content.trim().length > 0)
}

function normalizeOutputCssFileName(fileName: string) {
  return fileName.replace(/\\/g, '/')
}

function normalizeCssSnapshotFileKey(fileName: string) {
  return path.normalize(normalizeSnapshotName(normalizeOutputCssFileName(fileName)) ?? normalizeOutputCssFileName(fileName))
}

function compareCssOutputFile(a: string, b: string) {
  return compareText(normalizeSnapshotName(a) ?? a, normalizeSnapshotName(b) ?? b) || compareText(a, b)
}

function compareCssSnapshotEntry(
  a: { fileName: string, content: string },
  b: { fileName: string, content: string },
) {
  return compareText(normalizeSnapshotName(a.fileName) ?? a.fileName, normalizeSnapshotName(b.fileName) ?? b.fileName)
    || compareText(a.content, b.content)
    || compareText(a.fileName, b.fileName)
}

function withDuplicateCssFileSuffix(fileName: string, index: number) {
  const extension = path.extname(fileName)
  if (!extension) {
    return `${fileName}.${index}`
  }
  return `${fileName.slice(0, -extension.length)}.${index}${extension}`
}

function createStableCssSnapshots(
  generatorResult: Pick<GeneratorBuildResult, 'css' | 'cssFiles'> & Partial<Pick<GeneratorBuildResult, 'cssSnapshots'>>,
  fallbackFileName: string,
) {
  const cssSnapshots = generatorResult.cssSnapshots && generatorResult.cssSnapshots.length > 0
    ? generatorResult.cssSnapshots
    : [{ fileName: generatorResult.cssFiles[0] ?? fallbackFileName, content: generatorResult.css }]
  const entries = cssSnapshots.map((snapshot, index) => ({
    index,
    snapshot,
    fileName: normalizeSnapshotName(snapshot.fileName) ?? snapshot.fileName,
  }))
  const groups = new Map<string, typeof entries>()
  for (const entry of entries) {
    const group = groups.get(entry.fileName)
    if (group) {
      group.push(entry)
    }
    else {
      groups.set(entry.fileName, [entry])
    }
  }
  const stableFileNames = new Map<number, string>()

  for (const [fileName, group] of groups) {
    if (group.length === 1) {
      stableFileNames.set(group[0].index, fileName)
      continue
    }

    const sortedGroup = [...group].sort((a, b) => (
      compareText(a.snapshot.content, b.snapshot.content)
      || compareText(a.snapshot.fileName, b.snapshot.fileName)
    ))
    sortedGroup.forEach((entry, index) => {
      stableFileNames.set(entry.index, withDuplicateCssFileSuffix(fileName, index + 1))
    })
  }

  return entries
    .map(({ index, snapshot }) => ({
      ...snapshot,
      fileName: stableFileNames.get(index) ?? snapshot.fileName,
    }))
}

function createReportItem(
  project: CompareProject,
  generatorResult: GeneratorBuildResult,
): CompareReportItem {
  const generatorCss = normalizeCssForSummary(generatorResult.css)
  const generator = summarizeCss(generatorCss)
  const cssSnapshots = createStableCssSnapshots(generatorResult, project.cssFile)

  return {
    name: project.name,
    fixture: 'demo',
    platform: project.platform,
    allowedPlatforms: project.allowedPlatforms,
    cssFile: project.cssFile,
    cssFiles: cssSnapshots.length > 0 ? cssSnapshots.map(snapshot => snapshot.fileName) : [project.cssFile],
    status: 'passed',
    generator,
  }
}

function expectWeappViteTailwindV3CssIsolation(project: CompareProject, generatorResult: GeneratorBuildResult) {
  if (project.name !== 'weapp-vite-tailwindcss-v3') {
    return
  }
  expect(generatorResult.cssFiles, 'weapp-vite v3 should not emit source-root-prefixed css files').not.toContain('miniprogram/app.wxss')
  expect(generatorResult.cssFiles, 'weapp-vite v3 should not emit source-root-prefixed subpackage css files').not.toContain('miniprogram/sub-normal/pages/index.wxss')
  const independent = generatorResult.cssSnapshots.find(snapshot => snapshot.fileName === 'sub-independent/pages/index.wxss')
  expect(independent, 'weapp-vite v3 independent subpackage css snapshot should exist').toBeTruthy()
  expect(independent?.content, 'independent subpackage css should keep its own candidates').toMatch(/independent[-_]subpackage/i)
  expect(independent?.content, 'independent subpackage css should not include normal subpackage candidates').not.toMatch(/normal[-_]subpackage/i)
  expect(independent?.content, 'independent subpackage css should not include main package candidates').not.toContain('text-red-500')
}

function expectGulpTailwindV3SubpackageCssIsolation(project: CompareProject, generatorResult: GeneratorBuildResult) {
  if (project.name !== 'gulp-tailwindcss-v3') {
    return
  }
  const independent = generatorResult.cssSnapshots.find(snapshot => snapshot.fileName === 'sub-independent/pages/index.wxss')
  const normal = generatorResult.cssSnapshots.find(snapshot => snapshot.fileName === 'sub-normal/pages/index.wxss')
  expect(independent, 'gulp v3 independent subpackage css snapshot should exist').toBeTruthy()
  expect(normal, 'gulp v3 normal subpackage css snapshot should exist').toBeTruthy()
  expect(independent?.content, 'independent subpackage css should keep its own candidates').toMatch(/independent[-_]subpackage/i)
  expect(independent?.content, 'independent subpackage css should not include normal subpackage candidates').not.toMatch(/normal[-_]subpackage/i)
  expect(independent?.content, 'independent subpackage css should not include main package candidates').not.toContain('space-y-1')
  expect(normal?.content, 'normal subpackage css should keep its own candidates').toMatch(/normal[-_]subpackage/i)
  expect(normal?.content, 'normal subpackage css should not include independent subpackage candidates').not.toMatch(/independent[-_]subpackage/i)
  expect(normal?.content, 'normal subpackage css should not include main package candidates').not.toContain('space-y-1')
}

function expectSubpackageMarkersInGeneratedCss(project: CompareProject, generatorResult: GeneratorBuildResult) {
  if (!project.cssFile.includes('sub-normal') && !generatorResult.cssFiles.some(file => file.includes('sub-normal'))) {
    return
  }
  const css = generatorResult.cssSnapshots.length > 0
    ? generatorResult.cssSnapshots.map(snapshot => snapshot.content).join('\n')
    : generatorResult.css
  for (const pattern of SUBPACKAGE_MARKER_PATTERNS) {
    expect(css, `${project.name} generated css outputs should include ${pattern} marker`).toMatch(pattern)
  }
}

function expectUserImportedUiCssMarkers(project: CompareProject, generatorResult: GeneratorBuildResult) {
  for (const marker of USER_IMPORTED_UI_CSS_MARKERS) {
    expect(
      generatorResult.css,
      `${project.name} should keep user imported UI css marker ${marker}`,
    ).toContain(marker)
  }
}

function expectSubpackageCssFiles(project: CompareProject, generatorResult: GeneratorBuildResult) {
  const requiredSubpackageCssFiles = project.requiredCssFiles
    .map(file => file.replace(/\\/g, '/'))
    .filter(file => SUBPACKAGE_ROOTS.some(root => file.includes(root)))
    .map((file) => {
      const outputRoot = normalizeOutputCssFileName(path.dirname(project.cssPath))
      if (outputRoot && outputRoot !== '.' && file.startsWith(`${outputRoot}/`)) {
        return file.slice(outputRoot.length + 1)
      }
      return file
    })
    .map(normalizeOutputCssFileName)

  if (requiredSubpackageCssFiles.length === 0) {
    return
  }

  for (const requiredCssFile of requiredSubpackageCssFiles) {
    expect(
      generatorResult.cssFiles,
      `${project.name} should emit required subpackage css output ${requiredCssFile}`,
    ).toContain(requiredCssFile)
  }
}

function normalizeError(error: unknown) {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      shortMessage?: string
      message?: string
      stderr?: string
      stdout?: string
    }
    return maybeError.shortMessage
      ?? maybeError.message
      ?? maybeError.stderr
      ?? maybeError.stdout
      ?? String(error)
  }
  return String(error)
}

async function createProjectReport(
  project: CompareProject,
  options: CreateProjectReportOptions = {},
): Promise<AppsGeneratorCompareReportItem> {
  let generatorResult: GeneratorBuildResult
  try {
    generatorResult = await buildProject(project)
  }
  catch (error) {
    return {
      name: project.name,
      fixture: 'demo',
      platform: project.platform,
      allowedPlatforms: project.allowedPlatforms,
      cssFile: project.cssFile,
      cssFiles: [project.cssFile],
      status: 'failed',
      error: normalizeError(error),
    }
  }

  await options.onPassed?.({
    generatorResult,
  })

  return createReportItem(project, generatorResult)
}

async function expectReportSnapshot(report: AppsGeneratorCompareReportItem[]) {
  const jsonSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.json')
  const markdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.md')
  const chineseMarkdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.zh-CN.md')
  await expect(`${JSON.stringify(report, null, 2)}\n`).toMatchFileSnapshot(jsonSnapshotPath)
  await expectNormalizedReportSnapshot(markdownSnapshotPath, createMarkdownReport(report))
  await expectNormalizedReportSnapshot(chineseMarkdownSnapshotPath, createChineseMarkdownReport(report))
}

async function expectNormalizedReportSnapshot(snapshotPath: string, content: string) {
  await expect(normalizeReportSnapshotText(content)).toMatchFileSnapshot(snapshotPath)
}

function normalizeReportSnapshotText(source: string) {
  const normalized = source
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
  return `${normalized}\n`
}

function normalizeCssSnapshot(css: string) {
  return normalizeCssTextSnapshot(css)
}

function normalizeCssForSummary(css: string) {
  return `${normalizeCssSnapshot(css)}\n`
}

function formatAllowedPlatforms(platforms: string[]) {
  if (platforms.length === 0) {
    return '-'
  }
  return platforms.map(platform => `\`${platform.replaceAll('|', '\\|')}\``).join(', ')
}

function getCssArtifactFileName(fileName: string) {
  const normalized = normalizeOutputCssFileName(fileName).replace(/^\.\//, '')
  const withoutQuery = normalized.replace(/[?#].*$/, '')
  const safeFileName = withoutQuery
    .split('/')
    .filter(Boolean)
    .map(segment => segment.replace(/[^\w.-]/g, '-'))
    .join('__')
  return safeFileName || 'output.css'
}

function createCssArtifactSnapshot(snapshot: GeneratorCssSnapshot) {
  return `${normalizeCssSnapshot(snapshot.content).trimEnd()}\n`
}

function createCssOutputSnapshot(
  project: CompareProject,
  generatorResult: Pick<GeneratorBuildResult, 'css' | 'cssFiles'> & Partial<Pick<GeneratorBuildResult, 'cssSnapshots'>>,
) {
  const generatorCss = normalizeCssSnapshot(generatorResult.css)
  const generator = summarizeCss(`${generatorCss}\n`)
  const stableCssSnapshots = createStableCssSnapshots(generatorResult, project.cssFile)
  const cssSummaryRows = stableCssSnapshots.flatMap((snapshot) => {
    const summary = summarizeCss(`${normalizeCssSnapshot(snapshot.content)}\n`)
    const artifactFile = `artifacts/${getCssArtifactFileName(snapshot.fileName)}`
    return [
      `| \`${snapshot.fileName}\` | [${artifactFile}](${artifactFile}) | ${summary.bytes} | ${summary.selectors.length} | ${summary.hasSupports} | ${summary.hasHoverPseudo} | ${summary.hasTailwindBanner} | ${summary.hasSystemDarkModeMedia} | ${summary.hasManualDarkModeSelector} | ${summary.hasRawArbitrarySelector} | ${summary.hasWeappEscapedArbitrarySelector} |`,
    ]
  })
  const cssFileRows = stableCssSnapshots.map((snapshot, index) => {
    const artifactFile = `artifacts/${getCssArtifactFileName(snapshot.fileName)}`
    return `| ${index + 1} | \`${snapshot.fileName}\` | [${artifactFile}](${artifactFile}) |`
  })
  return [
    `# ${project.name} CSS Output`,
    '',
    'Fixture: demo',
    `Platform: ${project.platform}`,
    `Allowed platforms: ${formatAllowedPlatforms(project.allowedPlatforms)}`,
    `Entry: ${project.cssFile}`,
    '',
    '| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |',
    '| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |',
    `| ${generator.bytes} | ${generator.selectors.length} | ${generator.hasSupports} | ${generator.hasHoverPseudo} | ${generator.hasTailwindBanner} | ${generator.hasSystemDarkModeMedia} | ${generator.hasManualDarkModeSelector} | ${generator.hasRawArbitrarySelector} | ${generator.hasWeappEscapedArbitrarySelector} |`,
    '',
    '## Generator CSS Files',
    '',
    '| # | File | Artifact |',
    '| ---: | --- | --- |',
    ...cssFileRows,
    '',
    '## Generator CSS Summary',
    '',
    '| File | Artifact | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |',
    '| --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |',
    ...cssSummaryRows,
  ].join('\n')
}

async function expectCssOutputSnapshot(
  project: CompareProject,
  generatorResult: GeneratorBuildResult,
) {
  const snapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'css-output', path.join(project.platform, project.name, 'README.md'))
  await expectNormalizedReportSnapshot(snapshotPath, createCssOutputSnapshot(project, generatorResult))
  for (const snapshot of createStableCssSnapshots(generatorResult, project.cssFile)) {
    const artifactPath = await resolveSnapshotFile(
      __dirname,
      'apps-generator-mode',
      'css-output',
      path.join(project.platform, project.name, 'artifacts', getCssArtifactFileName(snapshot.fileName)),
    )
    await expect(createCssArtifactSnapshot(snapshot)).toMatchFileSnapshot(artifactPath)
  }
}

describe('demo generator mode output', () => {
  it('collects nested selectors and normalizes unsupported pseudo aliases', () => {
    expect(collectSelectors([
      '@media (prefers-color-scheme: dark) {',
      '  .dark_cbg-zinc-800 { color: black; }',
      '  .before_ccontent-_b_qx_q_B::before { content: "x"; }',
      '}',
      'view,text,:before,:after { box-sizing: border-box; }',
      '.bg-red-500:not(#\\#):not(#n) { color: red; }',
      '::-webkit-calendar-picker-indicator { display: none; }',
      '[hidden]:where(:not([hidden=\'until-found\'])) { display: none; }',
      '.nut-input .weui-input::placeholder { color: gray; }',
      'a,button,input:where([type=\'button\'], [type=\'reset\'], [type=\'submit\']) { font: inherit; }',
      'ul,textarea,video { display: block; }',
      '.prose .a { color: inherit; }',
      '.nut-video video { width: 100%; }',
    ].join('\n'))).toEqual([
      '.before_ccontent-_b_qx_q_B:before',
      '.bg-red-500',
      '.dark_cbg-zinc-800',
      '.nut-input .weui-input::placeholder',
      '.nut-video video',
      '.prose .a',
    ])
  })

  it('prints css metrics before raw css output blocks', async () => {
    const snapshot = await createCssOutputSnapshot({
      name: 'fixture-app',
      fixturesDir: '../demo',
      rootDir: 'fixture-app',
      platform: 'mp-weixin',
      allowedPlatforms: ['mp-weixin', 'h5'],
      cssFile: 'fixture-app/dist/app.wxss',
      cssPath: 'dist/app.wxss',
      requiredCssFiles: ['fixture-app/dist/app.wxss'],
    }, {
      css: '.generator { color: blue; }\n.shared { display: block; }\n',
      cssFiles: ['app.wxss', 'pages/index/index.wxss'],
      cssSnapshots: [
        { fileName: 'app.wxss', content: '.generator { color: blue; }\n' },
        { fileName: 'pages/index/index.wxss', content: '.shared { display: block; }\n' },
      ],
    })

    const generatorCssIndex = snapshot.indexOf('\n## Generator CSS\n')
    const cssTableIndex = snapshot.indexOf('| File | Bytes |')
    const firstCssBlockIndex = snapshot.indexOf('### app.wxss')

    expect(snapshot.indexOf('| Bytes |')).toBeGreaterThanOrEqual(0)
    expect(generatorCssIndex).toBe(-1)
    expect(cssTableIndex).toBe(-1)
    expect(firstCssBlockIndex).toBe(-1)
    expect(snapshot).toContain('# fixture-app CSS Output')
    expect(snapshot).toContain('Platform: mp-weixin')
    expect(snapshot).toContain('Allowed platforms: `mp-weixin`, `h5`')
    expect(snapshot).toContain('| 56 | 2 | false | false | false | false | false | false | false |')
    expect(snapshot).not.toContain('Generator CSS files:')
    expect(snapshot).toContain('## Generator CSS Files')
    expect(snapshot).toContain('| # | File | Artifact |')
    expect(snapshot).toContain('| 1 | `app.wxss` | [artifacts/app.wxss](artifacts/app.wxss) |')
    expect(snapshot).toContain('| 2 | `pages/index/index.wxss` | [artifacts/pages__index__index.wxss](artifacts/pages__index__index.wxss) |')
    expect(snapshot).toContain('| `app.wxss` | [artifacts/app.wxss](artifacts/app.wxss) | 28 | 1 | false | false | false | false | false | false | false |')
    expect(snapshot).toContain('| `pages/index/index.wxss` | [artifacts/pages__index__index.wxss](artifacts/pages__index__index.wxss) | 28 | 1 | false | false | false | false | false | false | false |')
    expect(snapshot).not.toContain('.generator { color: blue; }')
  })

  it('dedupes imported hashed css files from generator output snapshots', async () => {
    const root = await fs.mkdtemp(path.join(process.cwd(), '.tmp-mpx-css-snapshots-'))
    const outputRoot = path.join(root, 'dist/wx')
    await fs.mkdir(path.join(outputRoot, 'styles'), { recursive: true })
    await fs.writeFile(path.join(outputRoot, 'app.wxss'), '@import "./styles/app3b4a1ac6.wxss";\n')
    await fs.writeFile(path.join(outputRoot, 'styles/app3b4a1ac6.wxss'), '.from-mpx{color:red}\n')

    try {
      const snapshots = await collectOutputCssSnapshots(root, 'dist/wx/app.wxss')
      expect(snapshots.map(snapshot => snapshot.fileName)).toEqual([
        'app.wxss',
        'styles/app.wxss',
      ])
    }
    finally {
      await fs.rm(root, { force: true, recursive: true })
    }
  })

  it('normalizes hashed css output file order for snapshots', () => {
    expect([
      'index866b3e7e.wxss',
      'base29252032.wxss',
      'index573acbe4.wxss',
      'components94caae12.wxss',
    ].sort(compareCssOutputFile)).toEqual([
      'base29252032.wxss',
      'components94caae12.wxss',
      'index573acbe4.wxss',
      'index866b3e7e.wxss',
    ])

    expect([
      { fileName: 'index.wxss', content: '.b{}' },
      { fileName: 'index.wxss', content: '.a{}' },
      { fileName: 'base.wxss', content: '.z{}' },
    ].sort(compareCssSnapshotEntry)).toEqual([
      { fileName: 'base.wxss', content: '.z{}' },
      { fileName: 'index.wxss', content: '.a{}' },
      { fileName: 'index.wxss', content: '.b{}' },
    ])
  })

  it('builds retained demos with generator mini-program css output', async () => {
    const report: AppsGeneratorCompareReportItem[] = []

    for (const project of projects) {
      let generatorResult: GeneratorBuildResult | undefined
      const item = await createProjectReport(project, {
        onPassed(result) {
          generatorResult = result.generatorResult
        },
      })
      report.push(item)
      if (item.status === 'failed') {
        continue
      }

      expect(item.generator.bytes, `${project.name} generator css should not be empty`).toBeGreaterThan(0)
      expect(item.generator.hasSupports, `${project.name} generator css should remove unsupported @supports`).toBe(false)
      expect(item.generator.hasHoverPseudo, `${project.name} generator css should remove unsupported :hover`).toBe(false)
      expect(item.generator.hasTailwindBanner, `${project.name} generator css should not keep raw Tailwind banner`).toBe(false)
      expect(item.generator.hasSystemDarkModeMedia, `${project.name} generator css should include system dark mode`).toBe(true)
      expect(item.generator.hasManualDarkModeSelector, `${project.name} generator css should include manual theme-dark class mode`).toBe(true)
      expect(item.generator.hasUnsupportedThemeAttributeSelector, `${project.name} generator css should not include theme attribute selectors`).toBe(false)
      expect(item.generator.hasUnsupportedThemeComplexSelector, `${project.name} generator css should not include theme :where/:not selectors`).toBe(false)
      expect(item.generator.hasWeappEscapedArbitrarySelector || !item.generator.hasRawArbitrarySelector).toBe(true)
      if (generatorResult) {
        expectWeappViteTailwindV3CssIsolation(project, generatorResult)
        expectGulpTailwindV3SubpackageCssIsolation(project, generatorResult)
        expectSubpackageCssFiles(project, generatorResult)
        expectSubpackageMarkersInGeneratedCss(project, generatorResult)
        expectUserImportedUiCssMarkers(project, generatorResult)
        await expectCssOutputSnapshot(project, generatorResult)
      }
    }

    expect(report.filter(item => item.status === 'failed')).toEqual([])
    if (!projectFilterEnabled) {
      await expectReportSnapshot(report)
    }
  }, 1_800_000)
})
