import { mkdtempSync, mkdirSync, rmSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildTargets,
  collectPackageEntryStamps,
  resolveTargetStamps,
  shouldBuild,
} from '../../scripts/ensure-weapp-tailwindcss-built.mjs'

const temporaryRoots: string[] = []

function createPackageFixture(moduleEntry = './dist/index.js') {
  const packageRoot = mkdtempSync(path.join(tmpdir(), 'weapp-tailwindcss-ensure-'))
  temporaryRoots.push(packageRoot)
  mkdirSync(path.join(packageRoot, 'src'))
  mkdirSync(path.join(packageRoot, 'dist'))
  writeFileSync(path.join(packageRoot, 'package.json'), JSON.stringify({
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: moduleEntry,
        require: './dist/index.cjs',
      },
    },
    main: './dist/index.cjs',
    module: moduleEntry,
    types: './dist/index.d.ts',
  }))
  writeFileSync(path.join(packageRoot, 'src/index.ts'), 'export const value = 1\n')
  for (const file of ['dist/index.cjs', moduleEntry.slice(2), 'dist/index.d.ts']) {
    writeFileSync(path.join(packageRoot, file), '')
  }
  return packageRoot
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('ensure-weapp-tailwindcss-built', () => {
  it('从 package exports 推导 ESM 与 CJS 产物扩展名', () => {
    const postcssCalc = buildTargets.find(target => target.filter === '@weapp-tailwindcss/postcss-calc')!
    const reset = buildTargets.find(target => target.filter === '@weapp-tailwindcss/reset')!

    expect(resolveTargetStamps(postcssCalc)).toEqual(expect.arrayContaining([
      'dist/index.mjs',
      'dist/index.cjs',
      'dist/index.d.ts',
    ]))
    expect(resolveTargetStamps(reset)).toEqual(expect.arrayContaining([
      'dist/index.js',
      'dist/index.cjs',
      'dist/index.d.ts',
    ]))
  })

  it('只在公共入口缺失或源码更新后触发重建', () => {
    const packageRoot = createPackageFixture('./dist/index.mjs')
    const sourceFile = path.join(packageRoot, 'src/index.ts')
    const outputFile = path.join(packageRoot, 'dist/index.mjs')
    const now = Date.now() / 1000

    utimesSync(sourceFile, now - 10, now - 10)
    for (const stamp of collectPackageEntryStamps(packageRoot)) {
      utimesSync(path.join(packageRoot, stamp), now, now)
    }
    expect(shouldBuild({ packageRoot })).toBe(false)

    unlinkSync(outputFile)
    expect(shouldBuild({ packageRoot })).toBe(true)

    writeFileSync(outputFile, '')
    utimesSync(outputFile, now, now)
    utimesSync(sourceFile, now + 10, now + 10)
    expect(shouldBuild({ packageRoot })).toBe(true)
  })
})
