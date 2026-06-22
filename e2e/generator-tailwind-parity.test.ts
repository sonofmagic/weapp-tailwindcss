import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import tailwindcssPostcssV4 from '@tailwindcss/postcss'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  resolveTailwindV4Source,
} from 'weapp-tailwindcss/generator'
import { tailwindParityCandidateCategories, tailwindParityCandidates } from './fixtures/tailwind-parity-candidates'

const require = createRequire(import.meta.url)
const tailwindcssV4Version = require('tailwindcss4/package.json').version as string

const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

const TAILWIND_V4_CSS = [
  '@import "tailwindcss" source(none);',
  `@source inline('${tailwindParityCandidates.map(x => x.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')).join(' ')}');`,
  '',
].join('\n')

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ').trim()
}

const csslessMarkerCandidates = new Set([
  'group',
  'peer',
])

const requiredCoverageSamples = [
  'rounded-full',
  'w-[123px]',
  'h-[48rpx]',
  'text-[length:22rpx]',
  'w-[var(--panel-width)]',
  'text-[color:var(--brand-color)]',
  'bg-[color:var(--surface-color)]',
  '[--card-gap:16px]',
  'hover:!bg-red-500',
  'group-hover:text-white',
  'peer-[.is-dirty]:border-yellow-500',
  'has-[img]:p-0',
  '[&:not(:first-child)]:mt-2',
  'aria-[sort=ascending]:rotate-0',
  'data-[state=open]:block',
  'supports-[display:grid]:grid',
  '[@media(min-width:500px)]:text-lg',
  '[@container(min-width:30rem)]:grid',
]

function expectCandidateCoverage(classSet: Set<string>) {
  const expectedGeneratedCandidates = tailwindParityCandidates.filter(candidate => !csslessMarkerCandidates.has(candidate))
  const missing = expectedGeneratedCandidates.filter(candidate => !classSet.has(candidate))

  expect(Object.keys(tailwindParityCandidateCategories).length).toBeGreaterThanOrEqual(13)
  expect(tailwindParityCandidates.length).toBeGreaterThanOrEqual(300)
  for (const [category, values] of Object.entries(tailwindParityCandidateCategories)) {
    expect(values.length, `${category} coverage`).toBeGreaterThanOrEqual(10)
  }
  for (const sample of requiredCoverageSamples) {
    expect(tailwindParityCandidates, `${sample} should stay in shared parity fixture`).toContain(sample)
  }
  expect(missing).toEqual([])
}

async function createTailwindV4FixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-e2e-parity-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssV4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  return {
    root,
    cssEntry: path.join(root, 'app.css'),
  }
}

describe('generator tailwind parity', () => {
  it('keeps Tailwind v4 web output identical to tailwindcss v4 and records weapp contrast', async () => {
    expect(tailwindcssV4Version.startsWith('4.')).toBe(true)
    const fixture = await createTailwindV4FixtureRoot()

    const official = await postcss([
      tailwindcssPostcssV4({
        optimize: false,
      }),
    ]).process(TAILWIND_V4_CSS, {
      from: fixture.cssEntry,
    })
    const source = await resolveTailwindV4Source({
      css: TAILWIND_V4_CSS,
      base: fixture.root,
      packageName: 'tailwindcss',
    })
    const engine = createWeappTailwindcssGenerator(source)
    const web = await engine.generate({
      target: 'web',
    })
    const weapp = await engine.generate({
      target: 'weapp',
    })

    expect(web.css).toBe(web.rawCss)
    expectCandidateCoverage(web.classSet)
    expect(normalizeCss(web.css)).toBe(normalizeCss(official.css))
    expect(weapp.css).not.toBe(web.css)
    expect(weapp.css).toContain('page,.tw-root,wx-root-portal-content,:host')
    expect(weapp.css).toContain('.w-_b123px_B')
    expect(weapp.css).toContain('.h-_b48rpx_B')
    expect(weapp.css).toContain('border-radius: 9999px')
    expect(weapp.css).not.toContain('@property')
    expect(weapp.css).not.toContain('calc(infinity * 1px)')
  })

  it('matches Tailwind v4 cwd-based default source scanning for bare imports', async () => {
    expect(tailwindcssV4Version.startsWith('4.')).toBe(true)
    const fixture = await createTailwindV4FixtureRoot()
    const cssDir = path.join(fixture.root, 'src', 'styles')
    const pagesDir = path.join(fixture.root, 'pages')
    await mkdir(cssDir, { recursive: true })
    await mkdir(pagesDir, { recursive: true })
    await writeFile(path.join(pagesDir, 'index.html'), '<view class="bg-red-500 w-4"></view>', 'utf8')
    const cssEntry = path.join(cssDir, 'app.css')
    const css = '@import "tailwindcss";'
    await writeFile(cssEntry, css, 'utf8')

    const cwd = process.cwd()
    let officialCss = ''
    try {
      process.chdir(fixture.root)
      const official = await postcss([
        tailwindcssPostcssV4({
          optimize: false,
        }),
      ]).process(css, {
        from: cssEntry,
      })
      officialCss = official.css
    }
    finally {
      process.chdir(cwd)
    }

    const source = await resolveTailwindV4Source({
      projectRoot: fixture.root,
      cssEntries: [cssEntry],
      packageName: 'tailwindcss',
    })
    const engine = createWeappTailwindcssGenerator(source)
    const web = await engine.generate({
      target: 'web',
    })

    expect(web.classSet).toEqual(new Set(['bg-red-500', 'w-4']))
    expect(normalizeCss(web.css)).toBe(normalizeCss(officialCss))
  })
})
