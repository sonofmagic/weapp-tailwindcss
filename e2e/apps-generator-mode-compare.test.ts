import type { CompareReportItem, CssSummary } from './apps-generator-report'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { createChineseMarkdownReport, createMarkdownReport } from './apps-generator-report'
import { resolveSnapshotFile } from './shared'

type GeneratorBuildMode = 'generator' | 'legacy'

interface CompareProject {
  name: string
  fixturesDir: '../apps' | '../demo'
  root: string
  cssFile: string
  clean: string[]
}

const projects: CompareProject[] = [
  {
    name: 'vite-native',
    fixturesDir: '../apps',
    root: 'vite-native',
    cssFile: 'dist/app.wxss',
    clean: ['dist', '.tw-patch'],
  },
  {
    name: 'vite-native-ts',
    fixturesDir: '../apps',
    root: 'vite-native-ts',
    cssFile: 'dist/app.wxss',
    clean: ['dist', '.tw-patch'],
  },
  {
    name: 'uni-app-tailwindcss-v5',
    fixturesDir: '../demo',
    root: 'uni-app-tailwindcss-v5',
    cssFile: 'dist/build/mp-weixin/app.wxss',
    clean: ['dist', '.tw-patch'],
  },
  {
    name: 'taro-vite-tailwindcss-v5',
    fixturesDir: '../demo',
    root: 'taro-vite-tailwindcss-v5',
    cssFile: 'dist/app.wxss',
    clean: ['dist', '.tw-patch'],
  },
  {
    name: 'mpx-tailwindcss-v5',
    fixturesDir: '../demo',
    root: 'mpx-tailwindcss-v5',
    cssFile: 'dist/wx/app.wxss',
    clean: ['dist', '.tw-patch'],
  },
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

async function cleanProject(root: string, entries: string[]) {
  await Promise.all(entries.map(entry => fs.rm(path.resolve(root, entry), { recursive: true, force: true })))
}

async function buildProject(project: CompareProject, mode: GeneratorBuildMode) {
  const projectBase = path.resolve(__dirname, project.fixturesDir)
  const root = path.resolve(projectBase, project.root)
  await cleanProject(root, project.clean)

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

  const cssPath = path.resolve(root, project.cssFile)
  return fs.readFile(cssPath, 'utf8')
}

function createReportItem(project: CompareProject, legacyCss: string, generatorCss: string): CompareReportItem {
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
    legacy,
    generator,
    deltaBytes: generator.bytes - legacy.bytes,
    generatorBytesRatio: Number((generator.bytes / Math.max(legacy.bytes, 1)).toFixed(4)),
    sharedSelectors: sharedSelectors.slice(0, 20),
    generatorOnlySelectors: generatorOnlySelectors.slice(0, 20),
    legacyOnlySelectors: legacyOnlySelectors.slice(0, 20),
  }
}

async function expectReportSnapshot(report: CompareReportItem[]) {
  const jsonSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.json')
  const markdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.md')
  const chineseMarkdownSnapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'compare', 'report.zh-CN.md')
  await expect(`${JSON.stringify(report, null, 2)}\n`).toMatchFileSnapshot(jsonSnapshotPath)
  await expect(createMarkdownReport(report)).toMatchFileSnapshot(markdownSnapshotPath)
  await expect(createChineseMarkdownReport(report)).toMatchFileSnapshot(chineseMarkdownSnapshotPath)
}

describe('apps demo generator mode comparison', () => {
  it('builds apps and demos in legacy and generator modes with comparable mini-program css output', async () => {
    const report: CompareReportItem[] = []

    for (const project of projects) {
      const legacyCss = await buildProject(project, 'legacy')
      const generatorCss = await buildProject(project, 'generator')
      const item = createReportItem(project, legacyCss, generatorCss)
      report.push(item)

      expect(item.generator.bytes, `${project.name} generator css should not be empty`).toBeGreaterThan(0)
      expect(item.generator.hasSupports, `${project.name} generator css should remove unsupported @supports`).toBe(false)
      expect(item.generator.hasHoverPseudo, `${project.name} generator css should remove unsupported :hover`).toBe(false)
      expect(item.generator.hasTailwindBanner, `${project.name} generator css should not keep raw Tailwind banner`).toBe(false)
      expect(item.generator.hasWeappEscapedArbitrarySelector || !item.generator.hasRawArbitrarySelector).toBe(true)
    }

    await expectReportSnapshot(report)
  }, 600_000)
})
