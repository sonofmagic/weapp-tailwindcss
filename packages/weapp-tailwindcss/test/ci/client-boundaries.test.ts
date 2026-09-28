import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { auditArchitecture } from '../../../../scripts/architecture/audit'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture(bridge: string, name = '@weapp-tailwindcss/runtime') {
  const root = await mkdtemp(path.join(tmpdir(), 'client-boundaries-'))
  roots.push(root)
  const directory = path.join(root, 'packages-runtime', 'runtime')
  await mkdir(path.join(directory, 'src'), { recursive: true })
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name, exports: { '.': './dist/index.js', './tailwindcss': './dist/plugin.js' } }))
  await writeFile(path.join(directory, 'src', 'index.ts'), "export * from './bridge'")
  await writeFile(path.join(directory, 'src', 'bridge.ts'), bridge)
  await writeFile(path.join(directory, 'src', 'plugin.ts'), "import 'node:fs'; export const plugin = true")
  return root
}

describe('客户端入口依赖门禁', () => {
  it.each(['node:fs', 'fs/promises', 'vite', '@tailwindcss/oxide'])('拒绝间接引入 %s', async (specifier) => {
    const root = await fixture(`import '${specifier}'; export const value = 1`)
    const errors = auditArchitecture(root).errors.join('\n')
    expect(errors).toContain('客户端引入构建依赖')
    expect(errors).toContain('bridge.ts')
    expect(errors).toContain(specifier)
  })

  it('允许类型依赖，构建时主题插件不污染客户端入口', async () => {
    const root = await fixture("import type { Plugin } from 'vite'; export interface Value { plugin?: Plugin }", 'theme-transition')
    expect(auditArchitecture(root).errors).toEqual([])
  })
})
