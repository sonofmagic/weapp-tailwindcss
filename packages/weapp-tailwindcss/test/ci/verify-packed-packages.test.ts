import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getWorkspacePackages } from 'repoctl'
import { describe, expect, it } from 'vitest'
import { findWorkspaceProtocols } from '../../../../scripts/verify-packed-packages.mjs'

const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))

describe('发布包 manifest 校验', () => {
  it('发现全部公开 workspace 包', async () => {
    const packages = await getWorkspacePackages(workspaceRoot)

    expect(packages).toHaveLength(26)
    expect(packages.map(pkg => pkg.manifest.name)).toEqual(expect.arrayContaining([
      'weapp-tailwindcss',
      '@weapp-tailwindcss/cli',
      '@weapp-tailwindcss/runtime',
      'theme-transition',
    ]))
    expect(packages.every(pkg => pkg.manifest.private !== true)).toBe(true)
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
