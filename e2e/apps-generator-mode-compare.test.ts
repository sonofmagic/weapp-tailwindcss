import type { AppsGeneratorCompareReportItem, CompareReportItem, CssSummary } from './apps-generator-report'
import type { ProjectEntry } from './shared'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { createChineseMarkdownReport, createMarkdownReport } from './apps-generator-report'
import { E2E_PROJECTS, NATIVE_PROJECTS } from './projectEntries'
import { collectCssSnapshots, resolveSnapshotFile } from './shared'

type GeneratorBuildMode = 'generator' | 'legacy'

interface CompareProject {
  name: string
  fixturesDir: '../apps' | '../demo'
  rootDir: string
  cssFile: string
  cssPath: string
}

const nativeComparisonProjects = new Set(['vite-native', 'vite-native-ts'])
const MINI_PROGRAM_CSS_PATTERN = '**/*.{wx,ac,jx,tt,q,c,ty}ss'

const projects: CompareProject[] = [
  ...NATIVE_PROJECTS
    .filter(entry => nativeComparisonProjects.has(entry.name))
    .map(entry => createCompareProject(entry, '../apps')),
  ...E2E_PROJECTS.map(entry => createCompareProject(entry, '../demo')),
]

const SELECTOR_RE = /(^|\})([^{@}]*)\{/g

function normalizeSelector(selector: string) {
  return selector
    .replace(/\s+/g, ' ')
    .trim()
}

function collectSelectors(css: string) {
  const selectors = new Set<string>()
  SELECTOR_RE.lastIndex = 0
  let match = SELECTOR_RE.exec(css)
  while (match !== null) {
    const raw = match[2] ?? ''
    for (const item of raw.split(',')) {
      const selector = normalizeSelector(item)
      if (selector && !selector.startsWith('@')) {
        selectors.add(selector)
      }
    }
    match = SELECTOR_RE.exec(css)
  }
  return [...selectors].sort()
}

function summarizeCss(css: string): CssSummary {
  return {
    bytes: Buffer.byteLength(css),
    selectors: collectSelectors(css),
    hasSupports: css.includes('@supports'),
    hasHoverPseudo: /:hover\b/.test(css),
    hasTailwindBanner: /tailwindcss v\d+\./.test(css),
    hasWeappEscapedArbitrarySelector: /_b[^{}]*_B/.test(css),
    hasRawArbitrarySelector: /\\\[|\\\]/.test(css),
  }
}

function createCompareProject(entry: ProjectEntry, fixturesDir: '../apps' | '../demo'): CompareProject {
  const outputCssPath = path.join(entry.projectPath, entry.cssFile)
  const rootPrefix = `${entry.name}${path.sep}`
  const cssPath = outputCssPath.startsWith(rootPrefix)
    ? outputCssPath.slice(rootPrefix.length)
    : entry.cssFile

  return {
    name: entry.name,
    fixturesDir,
    rootDir: entry.name,
    cssFile: outputCssPath,
    cssPath,
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
  ])
}

async function buildProject(project: CompareProject, mode: GeneratorBuildMode) {
  const projectBase = path.resolve(__dirname, project.fixturesDir)
  const root = path.resolve(projectBase, project.rootDir)
  const projectRoot = path.resolve(projectBase, project.rootDir)
  await cleanProject(root)

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
      WEAPP_TW_GENERATOR_MODE: mode,
      npm_package_json: path.resolve(root, 'package.json'),
      INIT_CWD: root,
    },
  })

  const snapshots = await collectOutputCssSnapshots(projectRoot, project.cssPath)
  return {
    css: snapshots.map(snapshot => snapshot.content).join('\n'),
    cssFiles: snapshots.map(snapshot => snapshot.fileName),
  }
}

async function collectOutputCssSnapshots(projectRoot: string, cssPath: string) {
  const entrySnapshots = await collectCssSnapshots(projectRoot, cssPath)
  const outputRoot = path.dirname(path.resolve(projectRoot, cssPath))
  const allCssFiles = await fg(MINI_PROGRAM_CSS_PATTERN, {
    absolute: false,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const entryFileNames = new Set(entrySnapshots.map(snapshot => path.normalize(snapshot.fileName)))
  const extraSnapshots = await Promise.all(
    allCssFiles
      .sort()
      .filter(file => !entryFileNames.has(path.normalize(file)))
      .map(file => collectCssSnapshots(outputRoot, file)),
  )

  return [
    ...entrySnapshots,
    ...extraSnapshots.flat(),
  ]
}

function createReportItem(
  project: CompareProject,
  legacyResult: { css: string, cssFiles: string[] },
  generatorResult: { css: string, cssFiles: string[] },
): CompareReportItem {
  const legacyCss = legacyResult.css
  const generatorCss = generatorResult.css
  const legacy = summarizeCss(legacyCss)
  const generator = summarizeCss(generatorCss)
  const legacySelectorSet = new Set(legacy.selectors)
  const generatorSelectorSet = new Set(generator.selectors)
  const sharedSelectors = generator.selectors.filter(selector => legacySelectorSet.has(selector))
  const generatorOnlySelectors = generator.selectors.filter(selector => !legacySelectorSet.has(selector))
  const legacyOnlySelectors = legacy.selectors.filter(selector => !generatorSelectorSet.has(selector))

  return {
    name: project.name,
    fixture: project.fixturesDir === '../apps' ? 'apps' : 'demo',
    cssFile: project.cssFile,
    cssFiles: generatorResult.cssFiles.length > 0 ? generatorResult.cssFiles : legacyResult.cssFiles,
    status: 'passed',
    legacy,
    generator,
    deltaBytes: generator.bytes - legacy.bytes,
    generatorBytesRatio: Number((generator.bytes / Math.max(legacy.bytes, 1)).toFixed(4)),
    sharedSelectors: sharedSelectors.slice(0, 20),
    generatorOnlySelectors: generatorOnlySelectors.slice(0, 20),
    legacyOnlySelectors: legacyOnlySelectors.slice(0, 20),
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

async function createProjectReport(project: CompareProject): Promise<AppsGeneratorCompareReportItem> {
  let legacyResult: { css: string, cssFiles: string[] }
  try {
    legacyResult = await buildProject(project, 'legacy')
  }
  catch (error) {
    return {
      name: project.name,
      fixture: project.fixturesDir === '../apps' ? 'apps' : 'demo',
      cssFile: project.cssFile,
      cssFiles: [project.cssFile],
      status: 'failed',
      failedMode: 'legacy',
      error: normalizeError(error),
    }
  }

  let generatorResult: { css: string, cssFiles: string[] }
  try {
    generatorResult = await buildProject(project, 'generator')
  }
  catch (error) {
    return {
      name: project.name,
      fixture: project.fixturesDir === '../apps' ? 'apps' : 'demo',
      cssFile: project.cssFile,
      cssFiles: legacyResult.cssFiles.length > 0 ? legacyResult.cssFiles : [project.cssFile],
      status: 'failed',
      failedMode: 'generator',
      error: normalizeError(error),
    }
  }

  return createReportItem(project, legacyResult, generatorResult)
}

async function expectReportSnapshot(report: AppsGeneratorCompareReportItem[]) {
  const jsonSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.json')
  const markdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.md')
  const chineseMarkdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.zh-CN.md')
  await expect(`${JSON.stringify(report, null, 2)}\n`).toMatchFileSnapshot(jsonSnapshotPath)
  await expect(createMarkdownReport(report)).toMatchFileSnapshot(markdownSnapshotPath)
  await expect(createChineseMarkdownReport(report)).toMatchFileSnapshot(chineseMarkdownSnapshotPath)
}

describe('apps demo generator mode comparison', () => {
  it('builds apps and demos in legacy and generator modes with comparable mini-program css output', async () => {
    const report: AppsGeneratorCompareReportItem[] = []

    for (const project of projects) {
      const item = await createProjectReport(project)
      report.push(item)
      if (item.status === 'failed') {
        continue
      }

      expect(item.generator.bytes, `${project.name} generator css should not be empty`).toBeGreaterThan(0)
      expect(item.generator.hasSupports, `${project.name} generator css should remove unsupported @supports`).toBe(false)
      expect(item.generator.hasHoverPseudo, `${project.name} generator css should remove unsupported :hover`).toBe(false)
      expect(item.generator.hasTailwindBanner, `${project.name} generator css should not keep raw Tailwind banner`).toBe(false)
      expect(item.generator.hasWeappEscapedArbitrarySelector || !item.generator.hasRawArbitrarySelector).toBe(true)
    }

    expect(report.filter(item => item.status === 'failed')).toEqual([])
    await expectReportSnapshot(report)
  }, 1_800_000)
})
