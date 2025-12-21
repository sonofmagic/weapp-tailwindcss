import { describe, expect, it } from 'vitest'

import { isRunningInHBuilderX } from '@/utils/hbuilderx'

describe('isRunningInHBuilderX', () => {
  it('detects macOS uniapp-cli-vite cwd when NODE_PATH is missing', () => {
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd: '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite',
    })).toBe(true)
  })

  it('detects macOS uniapp-cli cwd when NODE_PATH is missing', () => {
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd: '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli',
    })).toBe(true)
  })

  it('detects windows plugin paths when NODE_PATH is missing', () => {
    const cwd = String.raw`C:\Program Files\HBuilderX\plugins\uniapp-cli-vite`
    expect(isRunningInHBuilderX({
      nodePath: '',
      cwd,
    })).toBe(true)
  })

  it('detects versioned windows plugin directory when NODE_PATH is missing', () => {
    const cwd = String.raw`E:\workspace\HBuilderX.4.87.2025121004\HBuilderX\plugins\uniapp-cli-vite`
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd,
    })).toBe(true)
  })

  it('detects root-level windows plugin directory when NODE_PATH is missing', () => {
    const cwd = String.raw`E:\HBuilderX\plugins\uniapp-cli-vite`
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd,
    })).toBe(true)
  })

  it('detects versioned windows plugin directory without vite suffix', () => {
    const cwd = String.raw`E:\workspace\HBuilderX.4.87.2025121004\HBuilderX\plugins\uniapp-cli`
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd,
    })).toBe(true)
  })

  it('returns false when NODE_PATH is present', () => {
    expect(isRunningInHBuilderX({
      nodePath: '/usr/local/lib/node_modules',
      cwd: '/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli',
    })).toBe(false)
  })

  it('returns false for regular working directories', () => {
    expect(isRunningInHBuilderX({
      nodePath: undefined,
      cwd: '/Users/foo/projects/demo-app',
    })).toBe(false)
  })
})
