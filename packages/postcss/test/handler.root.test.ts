import { describe, expect, it } from 'vitest'
import { createStyleHandler, postcss } from '@/index'

describe('style handler root api', () => {
  it('rejects a plugin replacing a single root with a document', async () => {
    const handler = createStyleHandler({
      postcssOptions: {
        plugins: [{
          postcssPlugin: 'replace-with-document',
          OnceExit(_root, { result }) {
            result.root = postcss.document({ nodes: [postcss.root()] })
          },
        }],
      },
    })
    await expect(handler.transformRoot(postcss.parse('.box { color: red }')))
      .rejects.toThrow('single PostCSS Root')
  })

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
