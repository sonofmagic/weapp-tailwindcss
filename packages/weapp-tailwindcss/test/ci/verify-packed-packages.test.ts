import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getWorkspacePackages } from 'repoctl'
import { describe, expect, it } from 'vitest'
import { findWorkspaceProtocols } from '../../../../scripts/verify-packed-packages.mjs'

const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))

describe('发布包 manifest 校验', () => {
  it('发现全部公开 workspace 包', async () => {
    const packages = await getWorkspacePackages(workspaceRoot)

    expect(packages).toHaveLength(30)
    expect(packages.map(pkg => pkg.manifest.name)).toEqual(expect.arrayContaining([
      'weapp-tailwindcss',
      '@weapp-tailwindcss/cli',
      '@weapp-tailwindcss/engine',
      '@weapp-tailwindcss/escape',
      '@weapp-tailwindcss/source-scan',
      '@weapp-tailwindcss/runtime',
      'theme-transition',
    ]))
    expect(packages.every(pkg => pkg.manifest.private !== true)).toBe(true)
  })

  it('公开包之间使用约定的 workspace 协议与发布范围', async () => {
    const packages = await getWorkspacePackages(workspaceRoot)
    const workspacePackageNames = new Set(packages.map(pkg => pkg.manifest.name))
    const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const
    // escape 迁移保留原消费者的范围策略，其余内部依赖仍固定到同批发布版本。
    const escapeRanges = new Map([
      ['@weapp-tailwindcss/cn', 'workspace:^'],
      ['@weapp-tailwindcss/merge', 'workspace:^'],
      ['@weapp-tailwindcss/runtime', 'workspace:^'],
      ['@weapp-tailwindcss/postcss', 'workspace:~'],
      ['weapp-tailwindcss', 'workspace:~'],
    ])
    const violations = packages.flatMap((pkg) => {
      return dependencySections.flatMap((section) => {
        const dependencies = pkg.manifest[section]
        if (!dependencies) {
          return []
        }
        return Object.entries(dependencies)
          .filter(([name, version]) => {
            const expected = name === '@weapp-tailwindcss/escape'
              ? escapeRanges.get(pkg.manifest.name) ?? 'workspace:*'
              : 'workspace:*'
            return workspacePackageNames.has(name) && version !== expected
          })
          .map(([name, version]) => `${pkg.manifest.name} -> ${section}.${name}=${version}`)
      })
    })

    expect(violations).toEqual([])
  })

  it('递归定位残留的 workspace 协议', () => {
    expect(findWorkspaceProtocols({
      dependencies: {
        '@weapp-tailwindcss/shared': 'workspace:*',
      },
      publishConfig: {
        directory: 'dist',
      },
    })).toEqual(['$.dependencies.@weapp-tailwindcss/shared'])
  })
})
