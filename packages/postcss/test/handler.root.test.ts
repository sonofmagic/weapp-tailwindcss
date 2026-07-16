import { describe, expect, it } from 'vitest'
import { createStyleHandler, postcss } from '@/index'

describe('style handler root api', () => {
  it('does not mutate the input root', async () => {
    const handler = createStyleHandler({
      cssOptions: {
        px2rpx: true,
      },
    })
    const root = postcss.parse('.box { width: 10px; }')

    const result = await handler.transformRoot(root)

    expect(root.toString()).toBe('.box { width: 10px; }')
    expect(result.css).toContain('10rpx')
  })

  it('returns independent roots for cached results', async () => {
    const handler = createStyleHandler()
    const root = postcss.parse('.box { color: red; }')

    const first = await handler.transformRoot(root)
    first.root.append({
      selector: '.mutated',
      nodes: [],
    })
    const second = await handler.transformRoot(root)

    expect(second.css).not.toContain('.mutated')
    expect(second.root).not.toBe(first.root)
  })
})
