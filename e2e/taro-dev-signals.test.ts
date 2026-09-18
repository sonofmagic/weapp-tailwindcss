import { describe, expect, it } from 'vitest'
import { TARO_BUILD_ERROR_RE, TARO_COMPILED_RE } from './watch/taro-dev-signals'

describe('Taro dev 完成信号', () => {
  it('捕获明确编译失败，不将普通警告当作失败', () => {
    expect(TARO_BUILD_ERROR_RE.test('Module runtime that is marked with syntheticNamedExports needs an explicit export')).toBe(true)
    expect(TARO_BUILD_ERROR_RE.test('webpack compiled with 2 errors')).toBe(true)
    expect(TARO_BUILD_ERROR_RE.test('Error during build')).toBe(true)
    expect(TARO_BUILD_ERROR_RE.test('webpack compiled with warnings')).toBe(false)
  })

  it.each(['900 modules transformed.', 'rendering chunks...', 'watching for file changes...', 'Module "runtime/index.js" that is marked with syntheticNamedExports needs an explicit export'])('不把中间阶段或错误当作成功：%s', (line) => {
    expect(TARO_COMPILED_RE.test(line)).toBe(false)
  })

  it.each(['built in 8266ms.', 'built in 1.25s.', 'Compiled successfully in 3.2s', 'webpack 5.105.4 compiled successfully in 600 ms'])('识别最终构建完成：%s', (line) => {
    expect(TARO_COMPILED_RE.test(line)).toBe(true)
  })
})
