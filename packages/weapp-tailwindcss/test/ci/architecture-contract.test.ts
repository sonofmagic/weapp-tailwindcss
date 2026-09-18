import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../../../..')

const forbiddenCssProcessingDeps = [
  '@csstools/css-color-parser',
  '@csstools/css-parser-algorithms',
  '@csstools/css-tokenizer',
  'autoprefixer',
  'lightningcss',
  'postcss',
  'postcss-preset-env',
  'postcss-pxtrans',
  'postcss-rem-to-responsive-pixel',
  'postcss-rule-unit-converter',
  'postcss-scss',
  'postcss-selector-parser',
  'postcss-value-parser',
] as const

const forbiddenCssProcessingImportRe = /from\s+['"](?:postcss-scss|@csstools\/css-tokenizer|@csstools\/css-parser-algorithms|@csstools\/css-color-parser|postcss-selector-parser|postcss-value-parser|lightningcss|postcss)['"]/

function readPackage(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')) as {
    name: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
}

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

describe('架构边界契约', () => {
  it('keeps runtime and native packages independent from bundler packages', () => {
    const forbiddenForRuntime = new Set(['weapp-tailwindcss', '@weapp-tailwindcss/postcss', 'webpack', 'vite', 'rspack'])
    const packageFiles = [
      'packages-runtime/runtime/package.json',
      'packages-runtime/merge/package.json',
      'packages-runtime/variants/package.json',
      'packages-runtime/cva/package.json',
      'packages/react-native/package.json',
      'packages/lynx/package.json',
    ]

    for (const file of packageFiles) {
      const pkg = readPackage(file)
      const dependencies = Object.keys(pkg.dependencies ?? {})
      const forbidden = dependencies.filter(name => forbiddenForRuntime.has(name))
      if (file === 'packages/react-native/package.json' || file === 'packages/lynx/package.json') {
        // P2 抽出 generator 前保留根包 facade；禁止继续增加其它 bundler 直依赖。
        expect(forbidden.filter(name => name !== 'weapp-tailwindcss'), `${pkg.name} must not add direct bundler dependencies`).toEqual([])
      }
      else {
        expect(forbidden, `${pkg.name} must stay runtime-only`).toEqual([])
      }
    }
  })

  it('uses catalogs for shared compiler and runtime utility versions', () => {
    const workspace = fs.readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
    expect(workspace).toContain('compilerUtilities:')
    expect(workspace).toContain('postcssCompat:')
    expect(workspace).toContain('runtimeVariants:')
    expect(workspace).toContain('runtimeLodash:')

    const packages = [
      readPackage('packages/weapp-tailwindcss/package.json'),
      readPackage('packages/postcss/package.json'),
      readPackage('packages-runtime/variants/package.json'),
      readPackage('packages-runtime/typography/package.json'),
    ]
    expect(packages[0].dependencies?.['oxc-parser']).toBe('catalog:compilerUtilities')
    expect(packages[1].dependencies?.['postcss-scss']).toBe('catalog:postcssCompat')
    expect(packages[2].dependencies?.['tailwind-variants']).toBe('catalog:runtimeVariants')
    expect(packages[3].dependencies?.['lodash.merge']).toBe('catalog:runtimeLodash')
  })

  it('keeps CSS processing dependencies inside @weapp-tailwindcss/postcss', () => {
    const main = readPackage('packages/weapp-tailwindcss/package.json')
    const postcss = readPackage('packages/postcss/package.json')
    const mainDeps = {
      ...main.dependencies,
      ...main.devDependencies,
    }

    for (const name of forbiddenCssProcessingDeps) {
      expect(mainDeps[name], `${name} must not be a weapp-tailwindcss dependency`).toBeUndefined()
    }

    expect(main.dependencies?.['@weapp-tailwindcss/postcss']).toBe('workspace:*')
    expect(postcss.dependencies?.['postcss-scss']).toBe('catalog:postcssCompat')
    expect(postcss.dependencies?.['@csstools/css-tokenizer']).toBe('catalog:csstools')
    expect(postcss.dependencies?.postcss).toBe('catalog:postcss85tilde')
  })

  it('keeps the v4 engine independent from product adapters and legacy engines', () => {
    const engine = readPackage('packages/engine/package.json')
    const dependencies = { ...engine.dependencies, ...engine.devDependencies }
    for (const name of ['@weapp-tailwindcss/postcss', 'weapp-tailwindcss', '@tailwindcss-mangle/engine', 'tailwindcss-patch', '@tailwindcss/vite', '@tailwindcss/postcss', 'tailwindcss-3']) {
      expect(dependencies[name], name).toBeUndefined()
    }
    expect(engine.dependencies?.postcss).toBe('catalog:postcss85tilde')
    expect(engine.dependencies?.['@tailwindcss/node']).toBe('catalog:tailwindcss4')
    const sources = collectTsFiles(path.join(repoRoot, 'packages/engine/src'))
      .map(file => fs.readFileSync(file, 'utf8'))
    for (const source of sources) {
      expect(source).not.toMatch(/@tailwindcss-mangle\/engine|from ['"](?:.*\/v3|@weapp-tailwindcss\/postcss|weapp-tailwindcss)['"]/)
    }
  })

  it('does not import CSS processors from weapp-tailwindcss source', () => {
    const srcRoot = path.join(repoRoot, 'packages/weapp-tailwindcss/src')
    const hits = collectTsFiles(srcRoot)
      .flatMap((file) => {
        const content = fs.readFileSync(file, 'utf8')
        return forbiddenCssProcessingImportRe.test(content)
          ? [path.relative(repoRoot, file)]
          : []
      })

    expect(hits).toEqual([])
  })
})
