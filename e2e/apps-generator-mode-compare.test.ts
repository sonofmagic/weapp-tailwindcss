import type { AppsGeneratorCompareReportItem, CompareReportItem, CssSummary } from './apps-generator-report'
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
import { E2E_PROJECTS } from './projectEntries'
import { clearProjectBuildState } from './projectTest'
import { collectCssSnapshots, resolveSnapshotFile } from './shared'
import { normalizeCssSnapshot as normalizeProjectCssSnapshot, normalizeSnapshotName } from './snapshotUtils'

interface CompareProject {
  name: string
  fixturesDir: '../demo'
  rootDir: string
  cssFile: string
  cssPath: string
}

interface CreateProjectReportOptions {
  onPassed?: (result: {
    generatorResult: { css: string, cssFiles: string[] }
  }) => void | Promise<void>
}

const MINI_PROGRAM_CSS_PATTERN = '**/*.{wx,ac,jx,tt,q,c,ty}ss'

const projects: CompareProject[] = [
  ...E2E_PROJECTS.map(entry => createCompareProject(entry, '../demo')),
]

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

function createCompareProject(entry: ProjectEntry, fixturesDir: '../demo'): CompareProject {
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
  await clearProjectBuildState(root)
}

async function buildProject(project: CompareProject) {
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
      npm_package_json: path.resolve(root, 'package.json'),
      INIT_CWD: root,
    },
  })

  const classList = await readBuildClassList(root)
  const snapshots = await collectOutputCssSnapshots(projectRoot, project.cssPath, classList)
  return {
    css: snapshots.map(snapshot => snapshot.content).join('\n'),
    cssFiles: snapshots.map(snapshot => snapshot.fileName),
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
    normalizeTailwindV4RootVariableNoise: projectRoot.endsWith(`${path.sep}taro-vite-tailwindcss-v4`),
  })
  const outputRoot = path.dirname(path.resolve(projectRoot, cssPath))
  const allCssFiles = await fg(MINI_PROGRAM_CSS_PATTERN, {
    absolute: false,
    cwd: outputRoot,
    onlyFiles: true,
  })
  const entryFileNames = new Set(entrySnapshots.map(snapshot => path.normalize(snapshot.fileName)))
  const extraSnapshots = await Promise.all(
    allCssFiles
      .sort(compareCssOutputFile)
      .filter(file => !entryFileNames.has(path.normalize(file)))
      .map(file => collectCssSnapshots(outputRoot, file, {
        classList,
        normalizeTailwindV4RootVariableNoise: projectRoot.endsWith(`${path.sep}taro-vite-tailwindcss-v4`),
      })),
  )

  return [
    ...entrySnapshots,
    ...extraSnapshots.flat().sort(compareCssSnapshotEntry),
  ]
}

function compareCssOutputFile(a: string, b: string) {
  return compareText(normalizeSnapshotName(a) ?? a, normalizeSnapshotName(b) ?? b) || compareText(a, b)
}

function compareCssSnapshotEntry(
  a: { fileName: string, content: string },
  b: { fileName: string, content: string },
) {
  return compareText(a.fileName, b.fileName) || compareText(a.content, b.content)
}

function createReportItem(
  project: CompareProject,
  generatorResult: { css: string, cssFiles: string[] },
): CompareReportItem {
  const generatorCss = normalizeCssForSummary(generatorResult.css)
  const generator = summarizeCss(generatorCss)

  return {
    name: project.name,
    fixture: 'demo',
    cssFile: project.cssFile,
    cssFiles: generatorResult.cssFiles.length > 0 ? generatorResult.cssFiles : [project.cssFile],
    status: 'passed',
    generator,
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
  let generatorResult: { css: string, cssFiles: string[] }
  try {
    generatorResult = await buildProject(project)
  }
  catch (error) {
    return {
      name: project.name,
      fixture: 'demo',
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
  await expect(createMarkdownReport(report)).toMatchFileSnapshot(markdownSnapshotPath)
  await expect(createChineseMarkdownReport(report)).toMatchFileSnapshot(chineseMarkdownSnapshotPath)
}

function normalizeCssSnapshot(css: string) {
  return normalizeProjectCssSnapshot(css)
    .trimEnd()
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
}

function normalizeCssForSummary(css: string) {
  return `${normalizeCssSnapshot(css)}\n`
}

function createCssOutputSnapshot(
  project: CompareProject,
  generatorResult: { css: string, cssFiles: string[] },
) {
  const generatorCss = normalizeCssSnapshot(generatorResult.css)
  const generator = summarizeCss(`${generatorCss}\n`)
  return [
    `# ${project.name} CSS Output`,
    '',
    'Fixture: demo',
    `Entry: ${project.cssFile}`,
    `Generator CSS files: ${generatorResult.cssFiles.join(', ')}`,
    '',
    '| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |',
    '| ---: | ---: | --- | --- | --- | --- | --- |',
    `| ${generator.bytes} | ${generator.selectors.length} | ${generator.hasSupports} | ${generator.hasHoverPseudo} | ${generator.hasTailwindBanner} | ${generator.hasRawArbitrarySelector} | ${generator.hasWeappEscapedArbitrarySelector} |`,
    '',
    '## Generator CSS',
    '',
    '```css',
    generatorCss,
    '```',
    '',
  ].join('\n')
}

async function expectCssOutputSnapshot(
  project: CompareProject,
  generatorResult: { css: string, cssFiles: string[] },
) {
  const snapshotPath = await resolveSnapshotFile(__dirname, 'apps-generator-mode', 'css-output', `${project.name}.md`)
  await expect(createCssOutputSnapshot(project, generatorResult)).toMatchFileSnapshot(snapshotPath)
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

  it('prints css metrics before raw css output blocks', () => {
    const snapshot = createCssOutputSnapshot({
      name: 'fixture-app',
      fixturesDir: '../demo',
      rootDir: 'fixture-app',
      cssFile: 'fixture-app/dist/app.wxss',
      cssPath: 'dist/app.wxss',
    }, {
      css: '.generator { color: blue; }\n.shared { display: block; }\n',
      cssFiles: ['app.wxss'],
    })

    expect(snapshot.indexOf('| Bytes |')).toBeLessThan(snapshot.indexOf('## Generator CSS'))
    expect(snapshot).toContain('# fixture-app CSS Output')
    expect(snapshot).toContain('| 56 | 2 | false | false | false | false | false |')
    expect(snapshot).toContain('.generator { color: blue; }')
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
      let generatorResult: { css: string, cssFiles: string[] } | undefined
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
      expect(item.generator.hasWeappEscapedArbitrarySelector || !item.generator.hasRawArbitrarySelector).toBe(true)

      if (generatorResult) {
        await expectCssOutputSnapshot(project, generatorResult)
      }
    }

    expect(report.filter(item => item.status === 'failed')).toEqual([])
    await expectReportSnapshot(report)
  }, 1_800_000)
})
