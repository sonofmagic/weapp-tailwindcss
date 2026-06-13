import { createRequire } from 'node:module'
import { mkdir, mkdtemp, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcssV3 from 'tailwindcss'
import tailwindcssPostcssV4 from '@tailwindcss/postcss'
import { createTailwindV3Engine, resolveTailwindV3Source } from '@/tailwindcss/v3-engine'
import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

const require = createRequire(import.meta.url)
const tailwindcssV3Version = require('tailwindcss/package.json').version as string
const tailwindcssV4Version = require('tailwindcss4/package.json').version as string
const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

const TAILWIND_V3_CSS = '@tailwind base; @tailwind components; @tailwind utilities;'
const TAILWIND_V3_CANDIDATES = [
  'container',
  'flex',
  'grid',
  'hover:bg-blue-500',
  'md:grid-cols-3',
  'before:content-["web"]',
  'w-[123px]',
  'text-[#123456]',
]
const TAILWIND_V4_CSS = [
  '@import "tailwindcss" source(none);',
  '@source inline("flex grid hover:bg-blue-500 md:grid-cols-3 before:content-[\'web\'] w-[123px] text-[#123456] bg-[url(/what_a_rush.png)]");',
  '',
].join('\n')

function normalizeCss(css: string) {
  return css.replace(/\s+/g, ' ').trim()
}

async function createTailwindV4FixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-web-parity-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssV4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  return {
    root,
    cssEntry: path.join(root, 'app.css'),
  }
}

describe('generator web parity', () => {
  it('keeps Tailwind v3 web output identical to tailwindcss v3', async () => {
    expect(tailwindcssV3Version.startsWith('3.')).toBe(true)

    const config = {
      content: [{
        raw: TAILWIND_V3_CANDIDATES.join(' '),
        extension: 'html',
      }],
    }
    const official = await postcss([
      tailwindcssV3(config),
    ]).process(TAILWIND_V3_CSS, {
      from: undefined,
    })
    const source = await resolveTailwindV3Source({
      css: TAILWIND_V3_CSS,
      base: process.cwd(),
      configObject: config,
    })
    const engine = createTailwindV3Engine(source)
    const web = await engine.generate({
      candidates: TAILWIND_V3_CANDIDATES,
      target: 'web',
    })
    const weapp = await engine.generate({
      candidates: TAILWIND_V3_CANDIDATES,
      styleOptions: {
        cssPreflight: {
          'box-sizing': 'border-box',
          'border-width': '0',
          'border-style': 'solid',
          'border-color': 'currentColor',
        },
      },
      target: 'weapp',
    })

    expect(web.css).toBe(web.rawCss)
    expect(normalizeCss(web.css)).toBe(normalizeCss(official.css))
    expect(weapp.css).not.toBe(web.css)
    expect(weapp.css).toContain('view,text,::before,::after')
    expect(weapp.css).toContain('.w-_b123px_B')
    expect(weapp.css).not.toContain('input:where')
  })

  it('keeps Tailwind v4 web output identical to tailwindcss v4', async () => {
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
    const engine = createTailwindV4Engine(source)
    const web = await engine.generate({
      target: 'web',
    })
    const weapp = await engine.generate({
      target: 'weapp',
    })

    expect(web.css).toBe(web.rawCss)
    expect(normalizeCss(web.css)).toBe(normalizeCss(official.css))
    expect(weapp.css).not.toBe(web.css)
    expect(weapp.css).toContain('page,.tw-root,wx-root-portal-content,:host')
    expect(weapp.css).toContain('.w-_b123px_B')
    expect(weapp.css).not.toContain('@property')
  })
})
