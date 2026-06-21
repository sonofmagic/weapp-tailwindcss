import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import cssVarsV4 from '@/cssVarsV4'

const require = createRequire(import.meta.url)

function readExistingFile(filepaths: string[]) {
  for (const filepath of filepaths) {
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, 'utf8')
    }
  }
  throw new Error(`missing Tailwind CSS v4 utility source files: ${filepaths.join(', ')}`)
}

function readTailwindV4UtilitiesSource() {
  const packageJson = require.resolve('tailwindcss4/package.json')
  const packageRoot = path.dirname(packageJson)
  const sourceFile = path.resolve(__dirname, '../../../submodules/tailwindcss-v4/packages/tailwindcss/src/utilities.ts')
  if (fs.existsSync(sourceFile)) {
    return fs.readFileSync(sourceFile, 'utf8')
  }

  return readExistingFile([
    path.resolve(packageRoot, 'dist/chunk-3IR7ZFJX.mjs'),
    path.resolve(packageRoot, 'dist/lib.js'),
  ])
}

function readTailwindV4BundledUtilitiesSource() {
  const packageJson = require.resolve('tailwindcss4/package.json')
  const packageRoot = path.dirname(packageJson)
  return readExistingFile([
    path.resolve(packageRoot, 'dist/chunk-3IR7ZFJX.mjs'),
    path.resolve(packageRoot, 'dist/lib.js'),
  ])
}

function addTailwindV4SourceOnlyProperties(props: Set<string>) {
  props.add('--tw-scrollbar-thumb')
  props.add('--tw-scrollbar-track')
}

function extractTailwindV4AtRootProperties(source: string) {
  const props = new Set<string>()
  for (const match of source.matchAll(/property\(\s*['`]([^'`]+)['`]/g)) {
    const prop = match[1]
    if (prop && !prop.includes('${')) {
      props.add(prop)
    }
  }
  if (props.size === 0) {
    const helperMatch = /\bfunction\s+([A-Za-z_$][\w$]*)\([^)]*\)\s*\{\s*return\s+[A-Za-z_$][\w$]*\(["']@property["']/.exec(source)
    const helperName = helperMatch?.[1]
    if (helperName) {
      const escapedHelperName = helperName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const helperCallRe = new RegExp(`${escapedHelperName}\\(\\s*['"](--tw-[^'"]+)['"]`, 'g')
      for (const match of source.matchAll(helperCallRe)) {
        const prop = match[1]
        if (prop) {
          props.add(prop)
        }
      }
      addTailwindV4SourceOnlyProperties(props)
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
  it('matches Tailwind CSS v4.2.4 atRoot property variables', () => {
    const source = readTailwindV4UtilitiesSource()
    const officialProps = extractTailwindV4AtRootProperties(source)
    const actualProps = new Set(cssVarsV4.map(item => item.prop))

    expect(officialProps.has('--tw-content')).toBe(true)

    expect(actualProps).toEqual(officialProps)
  })

  it('matches Tailwind CSS v4.2.4 bundled atRoot property variables', () => {
    const source = readTailwindV4BundledUtilitiesSource()
    const officialProps = extractTailwindV4AtRootProperties(source)
    const actualProps = new Set(cssVarsV4.map(item => item.prop))

    expect(officialProps.has('--tw-content')).toBe(true)

    expect(actualProps).toEqual(officialProps)
  })
})
