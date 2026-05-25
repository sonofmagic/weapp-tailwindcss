import { mkdir, mkdtemp, symlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcssV3 from 'tailwindcss'
import tailwindcssPostcssV4 from '@tailwindcss/postcss'
import { replaceWxml } from '@/wxml/shared'
import { createTailwindV3Engine, resolveTailwindV3Source } from '@/tailwindcss/v3-engine'
import { createTailwindV4Engine, resolveTailwindV4Source } from '@/tailwindcss/v4-engine'

const require = createRequire(import.meta.url)
const tailwindcssV3Version = require('tailwindcss/package.json').version as string
const tailwindcssV4Root = path.dirname(require.resolve('tailwindcss4/package.json'))

const TAILWIND_V3_CSS = '@tailwind base; @tailwind components; @tailwind utilities;'

// 这些语料从 Tailwind submodule 的 sort 与 variant-order 用例提炼而来，用于锁定官方生成顺序。
const TAILWIND_V3_ORDER_CORPUS = [
  'before:block',
  'after:content-[\'tail\']',
  'first:flex',
  'last:grid',
  'odd:bg-red-500',
  'even:bg-blue-500',
  'disabled:opacity-50',
  'group-hover:block',
  'peer-focus:flex',
  'py-3',
  'p-1',
  'px-3',
  'hover:p-1',
  'focus:hover:p-3',
  '!py-4',
  '!mt-2',
  '-translate-y-1',
  'rtl:flex',
  'dark:flex',
  'motion-safe:animate-pulse',
  'motion-reduce:transition-none',
  'md:grid-cols-3',
  'sm:w-4',
  'max-lg:p-2',
  'container',
  'bg-red-500',
  'bg-blue-500',
  'bg-[rgb(12,34,56)]',
  'bg-[var(--primary-color)]',
  'text-sm',
  'text-lg',
  'text-[55rpx]',
  'font-bold',
  'underline',
  'flex',
  'grid',
  'grid-cols-[200rpx_minmax(900rpx,_1fr)_100rpx]',
  'w-[123px]',
  'w-[calc(100%_-_12px)]',
  'text-[#123456]',
  'before:content-[\'x\']',
  'first-letter:text-red-500',
  'aria-[expanded=true]:max-h-[32rem]',
  'data-[state=open]:opacity-100',
  'supports-[display:grid]:grid',
  '[@supports(display:grid)]:grid',
  '[@media(any-hover:hover){&:hover}]:opacity-100',
  'max-[712px]:p-[13px]',
  '[--fg:#fff]',
  '[color:var(--fg)]',
]

const TAILWIND_V4_ORDER_CORPUS = [
  'before:block',
  'after:content-[\'tail\']',
  'first:flex',
  'last:grid',
  'odd:bg-red-500',
  'even:bg-blue-500',
  'disabled:opacity-50',
  'group-hover:block',
  'peer-focus:flex',
  'py-3',
  'p-1',
  'px-3',
  'hover:p-1',
  'focus:hover:p-3',
  'py-4!',
  'mt-2!',
  '-translate-y-1',
  'rtl:flex',
  'dark:flex',
  'starting:flex',
  'not-hover:flex',
  'motion-safe:animate-pulse',
  'motion-reduce:transition-none',
  'md:grid-cols-3',
  'sm:w-4',
  'max-lg:p-2',
  'bg-red-500',
  'bg-blue-500',
  'bg-[rgb(12,34,56)]',
  'bg-[var(--primary-color)]',
  'text-sm',
  'text-lg',
  'text-[55rpx]',
  'font-bold',
  'underline',
  'flex',
  'grid',
  'grid-cols-[200rpx_minmax(900rpx,_1fr)_100rpx]',
  'w-[123px]',
  'w-[calc(100%_-_12px)]',
  'text-[#123456]',
  'before:content-[\'x\']',
  'first-letter:text-red-500',
  'aria-[expanded=true]:max-h-[32rem]',
  'data-[state=open]:opacity-100',
  'supports-[display:grid]:grid',
  '[@supports(display:grid)]:grid',
  '[@media(any-hover:hover){&:hover}]:opacity-100',
  'max-[712px]:p-[13px]',
  '[--fg:#fff]',
  '[color:var(--fg)]',
]

const MINI_PROGRAM_STABLE_CORPUS = [
  'container',
  'flex',
  'grid',
  'p-1',
  'px-3',
  'py-3',
  'bg-red-500',
  'bg-blue-500',
  'text-sm',
  'text-lg',
  'font-bold',
  'underline',
  'w-[123px]',
  'w-[calc(100%_-_12px)]',
  'text-[55rpx]',
  'text-[#123456]',
]

function normalizeCss(css: string) {
  return css.replace(/\r\n/g, '\n').trim()
}

function collectRuleOrder(css: string) {
  const order: string[] = []
  const root = postcss.parse(css)

  root.walkRules((rule) => {
    const parents: string[] = []
    let parent = rule.parent
    while (parent && parent.type !== 'root') {
      if (parent.type === 'atrule') {
        parents.unshift(`@${parent.name} ${parent.params}`)
      }
      parent = parent.parent
    }
    order.push([...parents, rule.selector].join(' > '))
  })

  return order
}

function cssEscapeClassName(className: string) {
  return className.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`)
}

function collectCandidateOrder(css: string, candidates: string[]) {
  return candidates
    .map(candidate => ({
      candidate,
      index: css.indexOf(`.${cssEscapeClassName(candidate)}`),
    }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map(item => item.candidate)
}

function collectTransformedCandidateOrder(css: string, candidates: string[]) {
  return candidates
    .map(candidate => ({
      candidate,
      index: css.indexOf(`.${replaceWxml(candidate)}`),
    }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map(item => item.candidate)
}

function createTailwindV3Config(candidates: string[]) {
  return {
    content: [{
      raw: candidates.join(' '),
      extension: 'html',
    }],
  }
}

function createTailwindV4Css(candidates: string[]) {
  return [
    '@import "tailwindcss" source(none);',
    `@source inline(${JSON.stringify(candidates.join(' '))});`,
    '',
  ].join('\n')
}

function createTailwindV4CompatibilityCss(candidates: string[]) {
  return createTailwindV4Css(candidates.map(candidate => candidate.replace(/(^|:)text-\[([-+]?(?:\d+|\d*\.\d+)rpx)\](.*)$/u, '$1text-[length:$2]$3')))
}

function restoreTailwindV4CompatibilitySelectors(css: string) {
  return css.replace(/text-\\\[length\\:([-+]?(?:\d+|\d*\.\d+)rpx)\\\]/g, 'text-\\[$1\\]')
}

async function createTailwindV4FixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-v4-order-parity-'))
  const nodeModulesDir = path.join(root, 'node_modules')
  await mkdir(nodeModulesDir, { recursive: true })
  await symlink(tailwindcssV4Root, path.join(nodeModulesDir, 'tailwindcss'), 'dir')
  return {
    root,
    cssEntry: path.join(root, 'app.css'),
  }
}

describe('generator order parity', () => {
  it('keeps Tailwind v3 generated rule order identical to official Tailwind', async () => {
    expect(tailwindcssV3Version.startsWith('3.')).toBe(true)

    const config = createTailwindV3Config(TAILWIND_V3_ORDER_CORPUS)
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
    const result = await engine.generate({
      candidates: [...TAILWIND_V3_ORDER_CORPUS].reverse(),
      target: 'web',
    })

    expect(collectRuleOrder(result.css)).toEqual(collectRuleOrder(official.css))
    expect(normalizeCss(result.css)).toBe(normalizeCss(official.css))
  })

  it('keeps Tailwind v4 generated rule order identical to official Tailwind', async () => {
    const fixture = await createTailwindV4FixtureRoot()
    const css = createTailwindV4CompatibilityCss(TAILWIND_V4_ORDER_CORPUS)

    const official = await postcss([
      tailwindcssPostcssV4({
        optimize: false,
      }),
    ]).process(css, {
      from: fixture.cssEntry,
    })
    const source = await resolveTailwindV4Source({
      css,
      base: fixture.root,
      packageName: 'tailwindcss',
    })
    const result = await createTailwindV4Engine(source).generate({
      candidates: [...TAILWIND_V4_ORDER_CORPUS].reverse(),
      target: 'web',
    })
    const expectedCss = restoreTailwindV4CompatibilitySelectors(official.css)

    expect(collectRuleOrder(result.css)).toEqual(collectRuleOrder(expectedCss))
    expect(normalizeCss(result.css)).toBe(normalizeCss(expectedCss))
  })

  it('preserves Tailwind v3 order after mini-program selector transforms', async () => {
    const config = createTailwindV3Config(MINI_PROGRAM_STABLE_CORPUS)
    const source = await resolveTailwindV3Source({
      css: TAILWIND_V3_CSS,
      base: process.cwd(),
      configObject: config,
    })
    const result = await createTailwindV3Engine(source).generate({
      candidates: [...MINI_PROGRAM_STABLE_CORPUS].reverse(),
      target: 'weapp',
    })

    const rawOrder = collectCandidateOrder(result.rawCss, MINI_PROGRAM_STABLE_CORPUS)
    const transformedOrder = collectTransformedCandidateOrder(result.css, MINI_PROGRAM_STABLE_CORPUS)
    expect(transformedOrder).toEqual(rawOrder)
  })

  it('preserves Tailwind v4 order after mini-program selector transforms', async () => {
    const fixture = await createTailwindV4FixtureRoot()
    const source = await resolveTailwindV4Source({
      css: createTailwindV4Css(MINI_PROGRAM_STABLE_CORPUS),
      base: fixture.root,
      packageName: 'tailwindcss',
    })
    const result = await createTailwindV4Engine(source).generate({
      candidates: [...MINI_PROGRAM_STABLE_CORPUS].reverse(),
      target: 'weapp',
    })

    const rawOrder = collectCandidateOrder(result.rawCss, MINI_PROGRAM_STABLE_CORPUS)
    const transformedOrder = collectTransformedCandidateOrder(result.css, MINI_PROGRAM_STABLE_CORPUS)
    expect(transformedOrder).toEqual(rawOrder)
  })
})
