import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import cssVarsV3 from '@/cssVarsV3'
import cssVarsV4 from '@/cssVarsV4'

const require = createRequire(import.meta.url)

const V3_DEFAULT_GROUPS = [
  'border-spacing',
  'transform',
  'touch-action',
  'scroll-snap-type',
  'gradient-color-stops',
  'font-variant-numeric',
  'ring-width',
  'filter',
  'backdrop-filter',
  'contain',
]

const V3_THEME_DEFAULTS = new Map([
  ['--tw-ring-offset-width', '0px'],
  ['--tw-ring-offset-color', '#fff'],
  ['--tw-ring-color', 'rgb(59 130 246 / 0.5)'],
])

function readPackageFile(packageName: string, relativePath: string) {
  const packageJson = require.resolve(`${packageName}/package.json`)
  return fs.readFileSync(path.resolve(path.dirname(packageJson), relativePath), 'utf8')
}

function extractObjectBody(source: string, startIndex: number) {
  const openIndex = source.indexOf('{', startIndex)
  if (openIndex === -1) {
    throw new Error('object body not found')
  }

  let depth = 0
  for (let index = openIndex; index < source.length; index++) {
    const char = source[index]
    if (char === '{') {
      depth++
    }
    else if (char === '}') {
      depth--
      if (depth === 0) {
        return source.slice(openIndex + 1, index)
      }
    }
  }

  throw new Error('object body not closed')
}

function extractTailwindV3Defaults(source: string) {
  const defaults = new Map<string, string>()

  for (const group of V3_DEFAULT_GROUPS) {
    const marker = `addDefaults('${group}',`
    const markerIndex = source.indexOf(marker)
    expect(markerIndex, `missing Tailwind v3 defaults group ${group}`).toBeGreaterThanOrEqual(0)
    const body = extractObjectBody(source, markerIndex)
    for (const match of body.matchAll(/'(--tw-[^']+)':\s*([^,\n]+)/g)) {
      const prop = match[1]
      const value = match[2]?.trim()
      if (!prop || !value) {
        continue
      }
      defaults.set(prop, V3_THEME_DEFAULTS.get(prop) ?? value.replace(/^['"]|['"]$/g, ''))
    }
  }

  return [...defaults].map(([prop, value]) => ({ prop, value }))
}

function extractTailwindV4AtRootProperties(source: string) {
  const props = new Set<string>()
  for (const match of source.matchAll(/property\(\s*['`]([^'`]+)['`]/g)) {
    const prop = match[1]
    if (prop && !prop.includes('${')) {
      props.add(prop)
    }
  }

  for (const edge of ['top', 'right', 'bottom', 'left']) {
    props.add(`--tw-mask-${edge}-from-position`)
    props.add(`--tw-mask-${edge}-to-position`)
    props.add(`--tw-mask-${edge}-from-color`)
    props.add(`--tw-mask-${edge}-to-color`)
  }

  return props
}

describe('cssVars', () => {
  it('snap', () => {
    expect(cssVarsV3).toMatchSnapshot()
  })

  it('matches Tailwind CSS v3.4.19 addDefaults variables', () => {
    const source = readPackageFile('tailwindcss', 'src/corePlugins.js')
    expect(extractTailwindV3Defaults(source)).toEqual(cssVarsV3)
  })

  it('matches Tailwind CSS v4.2.4 atRoot property variables', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../submodules/tailwindcss-v4/packages/tailwindcss/src/utilities.ts'),
      'utf8',
    )
    const officialProps = extractTailwindV4AtRootProperties(source)
    const actualProps = new Set(cssVarsV4.map(item => item.prop))

    expect(officialProps.has('--tw-content')).toBe(true)

    expect(actualProps).toEqual(officialProps)
  })
})
