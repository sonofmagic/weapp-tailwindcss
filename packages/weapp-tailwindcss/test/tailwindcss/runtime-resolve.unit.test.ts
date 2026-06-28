import path from 'node:path'
import { mkdir, mkdtemp, realpath, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import {
  createDefaultResolvePaths,
  findTailwindConfig,
  resolveModuleFromPaths,
  resolveTailwindConfigFallback,
} from '@/tailwindcss/runtime-resolve'

describe('tailwind runtime resolve helpers', () => {
  it('resolves modules only for bare specifiers', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-runtime-resolve-'))
    const pkg = path.join(root, 'node_modules/pkg')
    await mkdir(pkg, { recursive: true })
    await writeFile(path.join(pkg, 'package.json'), JSON.stringify({ name: 'pkg', main: 'index.js' }))
    await writeFile(path.join(pkg, 'index.js'), 'module.exports = {}')

    await expect(realpath(resolveModuleFromPaths('pkg', [root])!)).resolves.toBe(await realpath(path.join(pkg, 'index.js')))
    expect(resolveModuleFromPaths('', [root])).toBeUndefined()
    expect(resolveModuleFromPaths('./pkg', [root])).toBeUndefined()
    expect(resolveModuleFromPaths('file:///tmp/pkg.js', [root])).toBeUndefined()
    expect(resolveModuleFromPaths(undefined, [root])).toBeUndefined()
    expect(resolveModuleFromPaths('pkg', [])).toBeUndefined()
  })

  it('finds configs and builds default resolve paths from package and workspace roots', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-runtime-paths-'))
    const project = path.join(root, 'packages/app')
    await mkdir(path.join(project, 'node_modules'), { recursive: true })
    await mkdir(path.join(root, 'node_modules/tailwindcss/stubs'), { recursive: true })
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ workspaces: ['packages/*'] }))
    await writeFile(path.join(project, 'package.json'), JSON.stringify({ name: 'app' }))
    await writeFile(path.join(project, 'tailwind.config.ts'), 'export default {}')
    await writeFile(path.join(root, 'node_modules/tailwindcss/stubs/config.full.js'), 'module.exports = {}')

    expect(findTailwindConfig([path.join(project, 'missing'), project])).toBe(path.join(project, 'tailwind.config.ts'))
    expect(findTailwindConfig([path.join(project, 'missing')])).toBeUndefined()
    const paths = createDefaultResolvePaths(project)
    expect(paths.map(item => item.replace('/private/var/', '/var/'))).toContain(path.join(project, 'node_modules'))
    await expect(realpath(resolveTailwindConfigFallback('tailwindcss', [root])!))
      .resolves.toBe(await realpath(path.join(root, 'node_modules/tailwindcss/stubs/config.full.js')))
    expect(resolveTailwindConfigFallback(undefined, [root])).toBeUndefined()
  })

  it('creates default resolve paths without an explicit basedir', () => {
    expect(createDefaultResolvePaths().length).toBeGreaterThan(0)
  })
})
