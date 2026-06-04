import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDefaultResolvePaths,
  findTailwindConfig,
  resolveModuleFromPaths,
  resolveTailwindConfigFallback,
} from '@/tailwindcss/patcher-resolve'

describe('tailwindcss patcher resolve helpers', () => {
  let tempRoot = ''

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), 'wtw-patcher-resolve-'))
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    if (tempRoot) {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  async function createFakeTailwindPackage(packageName = 'fake-tailwindcss') {
    const packageRoot = path.join(tempRoot, 'node_modules', packageName)
    await mkdir(path.join(packageRoot, 'stubs'), { recursive: true })
    await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({
      name: packageName,
      main: 'index.js',
    }), 'utf8')
    await writeFile(path.join(packageRoot, 'index.js'), 'module.exports = {}', 'utf8')
    await writeFile(path.join(packageRoot, 'stubs', 'config.full.js'), 'module.exports = {}', 'utf8')
    return realpath(packageRoot)
  }

  async function expectSameRealPath(actual: string | undefined, expected: string) {
    expect(actual).toBeTruthy()
    await expect(realpath(actual!)).resolves.toBe(await realpath(expected))
  }

  it('resolves package specifiers from custom lookup paths', async () => {
    const packageRoot = await createFakeTailwindPackage()

    await expectSameRealPath(resolveModuleFromPaths('fake-tailwindcss', [tempRoot]), path.join(packageRoot, 'index.js'))
    await expectSameRealPath(resolveModuleFromPaths('fake-tailwindcss', [path.join(tempRoot, 'node_modules')]), path.join(packageRoot, 'index.js'))
  })

  it('ignores empty, path-like, and unresolved specifiers', () => {
    expect(resolveModuleFromPaths(undefined, [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths('', [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths('fake-tailwindcss', [])).toBeUndefined()
    expect(resolveModuleFromPaths('./tailwindcss', [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths('../tailwindcss', [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths('file:///tailwindcss', [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths(path.join(tempRoot, 'tailwindcss'), [tempRoot])).toBeUndefined()
    expect(resolveModuleFromPaths('missing-tailwindcss', [tempRoot])).toBeUndefined()
  })

  it('resolves bundled tailwind config fallbacks by package name', async () => {
    const packageRoot = await createFakeTailwindPackage()

    expect(resolveTailwindConfigFallback(undefined, [tempRoot])).toBeUndefined()
    await expectSameRealPath(resolveTailwindConfigFallback('fake-tailwindcss', [tempRoot]), path.join(packageRoot, 'stubs', 'config.full.js'))
    expect(resolveTailwindConfigFallback('missing-tailwindcss', [tempRoot])).toBeUndefined()
  })

  it('finds the first supported tailwind config in search root order', async () => {
    const firstRoot = path.join(tempRoot, 'first')
    const secondRoot = path.join(tempRoot, 'second')
    await mkdir(firstRoot, { recursive: true })
    await mkdir(secondRoot, { recursive: true })
    await writeFile(path.join(firstRoot, 'tailwind.config.mts'), 'export default {}', 'utf8')
    await writeFile(path.join(secondRoot, 'tailwind.config.js'), 'module.exports = {}', 'utf8')

    expect(findTailwindConfig([firstRoot, secondRoot])).toBe(path.join(firstRoot, 'tailwind.config.mts'))
    expect(findTailwindConfig([path.join(tempRoot, 'missing')])).toBeUndefined()
  })

  it('builds default resolve paths from basedir, package root, cwd, and module directory', async () => {
    const workspaceRoot = path.join(tempRoot, 'workspace')
    const packageRoot = path.join(workspaceRoot, 'packages', 'demo')
    const basedir = path.join(packageRoot, 'src')
    await mkdir(path.join(basedir, 'node_modules'), { recursive: true })
    await mkdir(path.join(packageRoot, 'node_modules'), { recursive: true })
    await mkdir(path.join(workspaceRoot, 'node_modules'), { recursive: true })
    await writeFile(path.join(workspaceRoot, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n', 'utf8')
    await writeFile(path.join(packageRoot, 'package.json'), '{"name":"demo"}', 'utf8')
    vi.spyOn(process, 'cwd').mockReturnValue(path.join(tempRoot, 'outside'))

    const paths = createDefaultResolvePaths(basedir)

    expect(paths).toContain(path.join(basedir, 'node_modules'))
    expect(paths).toContain(path.join(packageRoot, 'node_modules'))
    expect(paths).toContain(path.join(workspaceRoot, 'node_modules'))
    expect(paths.some(item => item.includes('src/tailwindcss') || item.includes('src\\tailwindcss'))).toBe(true)
  })
})
