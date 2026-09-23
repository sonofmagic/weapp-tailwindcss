import type { LayoutRects } from './issue-1214/layout'
import { describe, expect, it } from 'vitest'
import { compareLayout } from './issue-1214/layout'

function rects(left = 0, top = 0): LayoutRects {
  return {
    'box': { left, top, width: 128, height: 128 },
    'padding': { left, top: top + 150, width: 128, height: 64 },
    'padding-child': { left: left + 16, top: top + 166, width: 16, height: 16 },
    'anchor': { left, top: top + 220, width: 64, height: 32 },
    'margin': { left, top: top + 236, width: 16, height: 16 },
    'gap-first': { left, top: top + 280, width: 16, height: 16 },
    'gap-second': { left: left + 32, top: top + 280, width: 16, height: 16 },
  }
}

describe('Issue #1214 运行时尺寸验收判定', () => {
  it('按窗口比例检查宽高、padding、负 margin 与子元素 gap，不依赖绝对位置', () => {
    const evidence = compareLayout(rects(), rects(180, 20), 375, 8)
    expect(evidence.passed).toBe(true)
    expect(evidence.comparisons.map(value => value.measured)).toEqual([128, 128, 16, 16, -16, 16])
  })

  it.each(['width', 'padding', 'negative-margin', 'gap'])('%s 未生效时不能被对照截图掩盖', (kind) => {
    const actual = rects()
    if (kind === 'width') {
      actual.box.width = 170
    }
    if (kind === 'padding') {
      actual['padding-child'].left = actual.padding.left
    }
    if (kind === 'negative-margin') {
      actual.margin.top = actual.anchor.top + actual.anchor.height
    }
    if (kind === 'gap') {
      actual['gap-second'].left = actual['gap-first'].left + actual['gap-first'].width
    }
    expect(compareLayout(actual, rects(180), 375, 8).passed).toBe(false)
  })

  it('工具类和对照同时错误仍不通过', () => {
    expect(compareLayout(rects(), rects(180), 750, 8).passed).toBe(false)
  })

  it('缺少渲染几何信息时直接失败', () => {
    const actual = rects()
    actual['gap-second'].width = 0
    expect(() => compareLayout(actual, rects(180), 375, 8)).toThrow('缺少有效的渲染矩形')
  })
})
