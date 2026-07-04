import { describe, expect, it } from 'vitest'
import { resolveGulpFrameworkProfile, resolveViteFrameworkProfile, resolveWebpackFrameworkProfile } from '@/bundlers/framework-selector'

describe('bundler framework selector', () => {
  it('keeps explicit appType ahead of package detection', () => {
    const profile = resolveViteFrameworkProfile({
      appType: 'taro',
      packageJson: {
        dependencies: {
          '@dcloudio/vite-plugin-uni': 'latest',
        },
      },
    })

    expect(profile).toMatchObject({
      appType: 'taro',
      frameworkName: 'taro',
    })
  })

  it('selects isolated Vite framework profiles', () => {
    expect(resolveViteFrameworkProfile({
      packageJson: {
        dependencies: {
          '@dcloudio/vite-plugin-uni': 'latest',
        },
      },
    }).frameworkName).toBe('uni-app')

    expect(resolveViteFrameworkProfile({
      packageJson: {
        dependencies: {
          '@tarojs/taro': 'latest',
        },
      },
    }).frameworkName).toBe('taro')

    expect(resolveViteFrameworkProfile({
      packageJson: {
        dependencies: {
          'weapp-vite': 'latest',
        },
      },
    }).frameworkName).toBe('weapp-vite')
  })

  it('selects isolated Webpack framework profiles', () => {
    expect(resolveWebpackFrameworkProfile({
      packageJson: {
        dependencies: {
          '@mpxjs/core': 'latest',
        },
      },
    }).frameworkName).toBe('mpx')

    expect(resolveWebpackFrameworkProfile({
      packageJson: {
        dependencies: {
          '@tarojs/webpack5-runner': 'latest',
        },
      },
    }).frameworkName).toBe('taro')

    expect(resolveWebpackFrameworkProfile({
      packageJson: {
        dependencies: {
          '@dcloudio/vue-cli-plugin-uni': 'latest',
        },
      },
    }).frameworkName).toBe('uni-app')
  })

  it('keeps uni-app x as a Vite framework profile and maps Webpack opt-in to uni-app', () => {
    expect(resolveViteFrameworkProfile({
      appType: 'uni-app-vite',
      uniAppX: true,
    })).toMatchObject({
      frameworkName: 'uni-app-x',
    })

    expect(resolveWebpackFrameworkProfile({
      appType: 'uni-app',
      uniAppX: {
        enabled: true,
      },
    }).frameworkName).toBe('uni-app')
  })

  it('keeps gulp on the native framework profile', () => {
    expect(resolveGulpFrameworkProfile({
      packageJson: {
        dependencies: {
          '@tarojs/taro': 'latest',
        },
      },
    })).toMatchObject({
      frameworkName: 'native',
    })
  })
})
