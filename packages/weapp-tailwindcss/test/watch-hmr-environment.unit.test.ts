import { describe, expect, it } from 'vitest'
import { createWatchProcessEnv } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/environment'

describe('watch 子进程环境边界', () => {
  it('隔离测试运行器环境并保留用户设备和构建配置', () => {
    const base = { NODE_ENV: 'test', BABEL_ENV: 'test', VITEST: 'true', VITEST_POOL_ID: '1', TARO_ENV: 'weapp', CI: '1', DEVICE_ID: 'local', PATH: 'custom' }
    expect(createWatchProcessEnv(base)).toEqual({ TARO_ENV: 'weapp', CI: '1', DEVICE_ID: 'local', PATH: 'custom' })
    expect(base.NODE_ENV).toBe('test')
    expect(base.VITEST).toBe('true')
  })

  it.each(['production', 'development'])('保留显式 %s 模式和额外参数', (mode) => {
    expect(createWatchProcessEnv({ NODE_ENV: 'test', BABEL_ENV: 'test', VITEST: 'true' }, { NODE_ENV: mode, BABEL_ENV: mode, CUSTOM: 'value' }))
      .toEqual({ NODE_ENV: mode, BABEL_ENV: mode, CUSTOM: 'value' })
  })
})
