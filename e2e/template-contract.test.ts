import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseAllDocuments } from 'yaml'
import manifest from '../packages/weapp-tailwindcss/package.json'
import { isTemplateVersionCompatible, TEMPLATE_PACKAGE_MANAGER } from './templateContract'

const major = Number(manifest.version.split('.')[0])

describe('模板稳定版兼容范围', () => {
  it.each([`^${major}.0.0`, `^${manifest.version}`, manifest.version])('接受兼容范围 %s', (range) => {
    expect(isTemplateVersionCompatible(range)).toBe(true)
  })

  it.each([`>=${major + 1}.0.0`, `<${major}.0.0`, 'invalid', 'workspace:*', undefined, null])('拒绝不兼容或无效范围 %s', (range) => {
    expect(isTemplateVersionCompatible(range)).toBe(false)
  })
})

it('所有模板的 manifest 和独立工具链锁文件使用仓库 pnpm 版本', async () => {
  const templates = fileURLToPath(new URL('../templates/', import.meta.url))
  const version = TEMPLATE_PACKAGE_MANAGER.replace(/^pnpm@/, '').split('+')[0]
  for (const entry of await readdir(templates, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }
    const root = path.join(templates, entry.name)
    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
    expect(manifest.packageManager, entry.name).toBe(TEMPLATE_PACKAGE_MANAGER)
    const documents = parseAllDocuments(await readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8'))
    expect(documents.flatMap(document => document.errors), entry.name).toEqual([])
    const toolchain = documents.map(document => document.toJS()).find(document => document.importers?.['.']?.packageManagerDependencies)
    expect(toolchain?.importers['.'].packageManagerDependencies.pnpm, entry.name).toEqual({ specifier: version, version })
  }
})
