import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

describe('framework plugin composition branches', () => {
  afterEach(() => {
    vi.doUnmock('@/bundlers/vite/shared/create-framework-plugins')
    vi.doUnmock('@/bundlers/webpack/shared/create-framework-plugin')
    vi.doUnmock('@/bundlers/gulp/shared/create-native-framework-plugins')
    vi.resetModules()
  })

  it('routes Vite public entry to framework factories', async () => {
    vi.doMock('@/bundlers/vite/shared/create-framework-plugins', () => ({
      createViteFrameworkPlugins: vi.fn((_options, branch) => [{ name: branch.branchName }]),
    }))

    const { WeappTailwindcss } = await import('@/bundlers/vite')

    expect(WeappTailwindcss({ appType: 'taro' })?.[0]?.name).toBe('taro-vite')
    expect(WeappTailwindcss({ appType: 'uni-app-vite' })?.[0]?.name).toBe('uni-app-vite')
    expect(WeappTailwindcss({ appType: 'uni-app-x' })?.[0]?.name).toBe('uni-app-x-vite')
    expect(WeappTailwindcss({ appType: 'weapp-vite' })?.[0]?.name).toBe('weapp-vite')
  })

  it('keeps uni-app-x Vite plugin composition inside its framework branch', async () => {
    const root = path.resolve(__dirname, '../..')
    const sharedSource = await readFile(
      path.join(root, 'src/bundlers/vite/shared/create-framework-plugins.ts'),
      'utf8',
    )
    const uniAppXSource = await readFile(
      path.join(root, 'src/bundlers/vite/frameworks/uni-app-x/index.ts'),
      'utf8',
    )

    expect(sharedSource).not.toContain("from '@/uni-app-x/vite'")
    expect(uniAppXSource).toContain("from '@/uni-app-x/vite'")
  })

  it('routes Webpack public class to framework classes', async () => {
    const appliedBranches: string[] = []

    vi.doMock('@/bundlers/webpack/shared/create-framework-plugin', () => ({
      weappTailwindcssPackageDir: '/mock/weapp-tailwindcss',
      WebpackFrameworkPlugin: class {
        appType: string | undefined
        options: Record<string, unknown>
        private branchName: string

        constructor(options: Record<string, unknown> = {}, branch: { branchName: string }) {
          this.options = options
          this.appType = options.appType as string | undefined
          this.branchName = branch.branchName
        }

        apply() {
          appliedBranches.push(this.branchName)
        }
      },
    }))

    const { WeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')

    new WeappTailwindcss({ appType: 'taro' }).apply({ options: {}, context: process.cwd() } as any)
    new WeappTailwindcss({ appType: 'mpx' }).apply({ options: {}, context: process.cwd() } as any)
    new WeappTailwindcss({ appType: 'uni-app' }).apply({ options: {}, context: process.cwd() } as any)

    expect(appliedBranches).toEqual([
      'taro-webpack',
      'mpx-webpack',
      'uni-app-webpack',
    ])
  })

  it('routes Gulp public entry to native framework factory', async () => {
    vi.doMock('@/bundlers/gulp/shared/create-native-framework-plugins', () => ({
      createNativeGulpPlugins: vi.fn(options => [`native-gulp:${options.appType ?? 'native'}`]),
    }))

    const { createPlugins } = await import('@/bundlers/gulp')

    expect(createPlugins()).toEqual(['native-gulp:native'])
    expect(createPlugins({ appType: 'native' })).toEqual(['native-gulp:native'])
  })
})
