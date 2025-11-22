import { afterEach, describe, expect, it, vi } from 'vitest'

describe('workspace helpers', () => {
  afterEach(() => {
    vi.doUnmock('node:fs')
    vi.resetModules()
  })

  it('locates the nearest pnpm workspace root', async () => {
    vi.doMock('node:fs', () => ({
      existsSync: (target: string) => target === '/repo/pnpm-workspace.yaml',
    }))

    const { findWorkspaceRoot } = await import('@/context/workspace')

    expect(findWorkspaceRoot('/repo/apps/foo')).toBe('/repo')
  })

  it('scans workspace directories to find a package', async () => {
    vi.doMock('node:fs', () => {
      const files = new Map<string, string | true>([
        ['/repo/pnpm-workspace.yaml', true],
        ['/repo/packages/foo/package.json', JSON.stringify({ name: '@demo/foo' })],
        ['/repo/packages/bar/package.json', JSON.stringify({ name: '@demo/bar' })],
      ])
      const dirEntries = new Map<string, string[]>([
        ['/repo', ['packages']],
        ['/repo/packages', ['foo', 'bar']],
        ['/repo/packages/foo', []],
        ['/repo/packages/bar', []],
      ])

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

    expect(findWorkspacePackageDir('/repo', '@demo/foo')).toBe('/repo/packages/foo')
    expect(findWorkspacePackageDir('/repo', '@demo/missing')).toBeUndefined()
  })
})
