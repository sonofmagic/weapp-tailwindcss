import type { Plugin } from 'postcss'
import { describe, expect, it } from 'vitest'
import { fingerprintOptions } from '@/fingerprint'
import { createStyleHandler } from '@/handler'

function colorPlugin(color: () => string): Plugin {
  return {
    postcssPlugin: 'test-color',
    Once(root) {
      root.walkDecls('color', declaration => { declaration.value = color() })
    },
  }
}

describe('样式缓存输入身份', () => {
  it('不同内容即使短哈希碰撞也不能复用结果', async () => {
    const handler = createStyleHandler({ cssPreflight: false, isMainChunk: false })
    expect((await handler('.x{z-index:19842}')).css).toContain('19842')
    expect((await handler('.x{z-index:127198}')).css).toContain('127198')
  })

  it('区分同名闭包并稳定识别同一函数', () => {
    const first = colorPlugin(() => 'red')
    const second = colorPlugin(() => 'blue')
    expect(fingerprintOptions(first)).toBe(fingerprintOptions(first))
    expect(fingerprintOptions(first)).not.toBe(fingerprintOptions(second))
  })

  it('调用级插件替换后采用新闭包', async () => {
    const handler = createStyleHandler({ cssPreflight: false, isMainChunk: false })
    const run = (color: string) => handler('.x{color:black}', {
      postcssOptions: { plugins: [colorPlugin(() => color)] },
    })
    expect((await run('red')).css).toContain('color:red')
    expect((await run('blue')).css).toContain('color:blue')
  })

  it('同一插件依赖的外部状态变化后重新执行', async () => {
    let color = 'red'
    const handler = createStyleHandler({
      cssPreflight: false,
      isMainChunk: false,
      postcssOptions: { plugins: [colorPlugin(() => color)] },
    })
    expect((await handler('.x{color:black}')).css).toContain('color:red')
    color = 'blue'
    expect((await handler('.x{color:black}')).css).toContain('color:blue')
  })

  it('保护占位内容一致时仍按原始输入区分动态变量', async () => {
    const handler = createStyleHandler({ appType: 'uni-app-x', majorVersion: 4, cssPreflight: false, isMainChunk: false })
    const first = '.x{width:var(--author-a, 10px)}'
    const second = '.x{width:var(--author-b, 20px)}'
    expect((await handler(first)).css).toContain('--author-a')
    expect((await handler(second)).css).toContain('--author-b')
  })
})
