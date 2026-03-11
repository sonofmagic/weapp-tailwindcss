import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('workspace helpers', () => {
  afterEach(() => {
    vi.doUnmock('node:fs')
    vi.resetModules()
  })

  it('locates the nearest pnpm workspace root', async () => {
    // Windows 下 path.join/resolve 会产生平台原生路径，mock 需使用 path.join 保持一致
    const workspaceFile = path.join(path.resolve('/repo'), 'pnpm-workspace.yaml')
    vi.doMock('node:fs', () => ({
      existsSync: (target: string) => target === workspaceFile,
    }))

    const { findWorkspaceRoot } = await import('@/context/workspace')

    expect(findWorkspaceRoot('/repo/apps/foo')).toBe(path.resolve('/repo'))
  })

  it('scans workspace directories to find a package', async () => {
    // 所有 mock 路径需使用 path.resolve/path.join 以匹配平台原生格式
    const resolvedRepo = path.resolve('/repo')
    const files = new Map<string, string | true>([
      [path.join(resolvedRepo, 'pnpm-workspace.yaml'), true],
      [path.join(resolvedRepo, 'packages', 'foo', 'package.json'), JSON.stringify({ name: '@demo/foo' })],
      [path.join(resolvedRepo, 'packages', 'bar', 'package.json'), JSON.stringify({ name: '@demo/bar' })],
    ])
    const dirEntries = new Map<string, string[]>([
      [resolvedRepo, ['packages']],
      [path.join(resolvedRepo, 'packages'), ['foo', 'bar']],
      [path.join(resolvedRepo, 'packages', 'foo'), []],
      [path.join(resolvedRepo, 'packages', 'bar'), []],
    ])

    vi.doMock('node:fs', () => {
      return {
        existsSync: (target: string) => files.has(target),
        readFileSync: (target: string) => {
          const content = files.get(target)
          if (typeof content === 'string') {
            return content
          }
          throw new Error(`Unexpected read: ${target}`)
        },
        readdirSync: (target: string, options?: { withFileTypes?: boolean }) => {
          const entries = dirEntries.get(target) ?? []
          if (options?.withFileTypes) {
            return entries.map(name => ({
              name,
              isDirectory: () => true,
              isSymbolicLink: () => false,
            }))
          }
          return entries
        },
      }
    })

    const { findWorkspacePackageDir } = await import('@/context/workspace')

    expect(findWorkspacePackageDir('/repo', '@demo/foo')).toBe(path.join(resolvedRepo, 'packages', 'foo'))
    expect(findWorkspacePackageDir('/repo', '@demo/missing')).toBeUndefined()
  })
})
