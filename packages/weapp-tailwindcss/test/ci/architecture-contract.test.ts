import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../../../..')

function readPackage(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')) as {
    name: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
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
})
