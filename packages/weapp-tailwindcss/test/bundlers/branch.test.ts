import { describe, expect, it } from 'vitest'
import { resolveBundlerAppBranch } from '@/bundlers/branches'

describe('bundler app branch resolver', () => {
  it('keeps explicit appType ahead of package detection', () => {
    const branch = resolveBundlerAppBranch({
      appType: 'taro',
      bundler: 'vite',
      packageJson: {
        dependencies: {
          '@dcloudio/vite-plugin-uni': 'latest',
        },
      },
    })

    expect(branch).toMatchObject({
      appType: 'taro',
      branch: 'taro-vite',
      isTaro: true,
    })
  })

  it('routes Vite frameworks to isolated branches', () => {
    expect(resolveBundlerAppBranch({
      bundler: 'vite',
      packageJson: {
        dependencies: {
          '@dcloudio/vite-plugin-uni': 'latest',
        },
      },
    }).branch).toBe('uni-app-vite')

    expect(resolveBundlerAppBranch({
      bundler: 'vite',
      packageJson: {
        dependencies: {
          '@tarojs/taro': 'latest',
        },
      },
    }).branch).toBe('taro-vite')

    expect(resolveBundlerAppBranch({
      bundler: 'vite',
      packageJson: {
        dependencies: {
          'weapp-vite': 'latest',
        },
      },
    }).branch).toBe('weapp-vite')
  })

  it('routes Webpack frameworks to isolated branches', () => {
    expect(resolveBundlerAppBranch({
      bundler: 'webpack',
      packageJson: {
        dependencies: {
          '@mpxjs/core': 'latest',
        },
      },
    }).branch).toBe('mpx-webpack')

    expect(resolveBundlerAppBranch({
      bundler: 'webpack',
      packageJson: {
        dependencies: {
          '@tarojs/webpack5-runner': 'latest',
        },
      },
    }).branch).toBe('taro-webpack')

    expect(resolveBundlerAppBranch({
      bundler: 'webpack',
      packageJson: {
        dependencies: {
          '@dcloudio/vue-cli-plugin-uni': 'latest',
        },
      },
    }).branch).toBe('uni-app-webpack')
  })

  it('lets uniAppX opt-in move any bundler to the uni-app-x-vite branch', () => {
    expect(resolveBundlerAppBranch({
      appType: 'uni-app-vite',
      bundler: 'vite',
      uniAppX: true,
    })).toMatchObject({
      branch: 'uni-app-x-vite',
      isUniAppX: true,
    })

    expect(resolveBundlerAppBranch({
      appType: 'uni-app',
      bundler: 'webpack',
      uniAppX: {
        enabled: true,
      },
    }).branch).toBe('uni-app-x-vite')
  })

  it('keeps gulp on the native branch', () => {
    expect(resolveBundlerAppBranch({
      bundler: 'gulp',
      packageJson: {
        dependencies: {
          '@tarojs/taro': 'latest',
        },
      },
    })).toMatchObject({
      branch: 'native-gulp',
      bundler: 'gulp',
    })
  })
})
