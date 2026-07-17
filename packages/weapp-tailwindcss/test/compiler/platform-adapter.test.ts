import { describe, expect, it, vi } from 'vitest'
import { createStyleHandler, postcss } from '@weapp-tailwindcss/postcss'
import { areArtifactsSemanticallyEqual, createCssFragment, createGenerationArtifact, createPassthroughPlatformAdapter, createStylePlatformAdapter } from '@/compiler'

const scope = { id: 'global', kind: 'global' as const }

function createArtifact(css = '.box { width: 10px; }') {
  return createGenerationArtifact([
    createCssFragment({
      id: 'utilities',
      kind: 'tailwind',
      css,
      sourceId: '/src/app.css',
      scope,
    }),
  ], {
    classSet: new Set(['box']),
    rawCandidates: new Set(['box']),
    dependencies: [],
    sourceEntries: [],
  })
}

describe('compiler platform adapter', () => {
  it('transforms cloned roots through the style adapter', async () => {
    const artifact = createArtifact()
    const adapter = createStylePlatformAdapter({
      id: 'mini-program',
      styleHandler: createStyleHandler({
        cssOptions: {
          px2rpx: true,
        },
      }),
    })

    const transformed = await adapter.transform(artifact, { stage: 'adapted' })

    expect(transformed.fragments[0]!.root.toString()).toContain('rpx')
    expect(artifact.fragments[0]!.root.toString()).toContain('10px')
  })

  it('compares semantic CSS while ignoring comments and formatting', async () => {
    const left = createArtifact('/*! generated */\n.box{width:10px}')
    const right = createArtifact('.box { width: 10px; }')
    const adapter = createPassthroughPlatformAdapter('web')
    const cloned = await adapter.transform(left, { stage: 'raw' })

    expect(areArtifactsSemanticallyEqual(cloned, right)).toBe(true)
  })

  it('takes ownership of a cloned handler result root', async () => {
    let handlerResultRoot: ReturnType<typeof postcss.root> | undefined
    const transformRoot = vi.fn(async (root: ReturnType<typeof postcss.root>) => {
      const result = root.clone().toResult()
      handlerResultRoot = result.root
      return result
    })
    const styleHandler = Object.assign(
      vi.fn(async (css: string) => postcss.parse(css).toResult()),
      { transformRoot },
    )
    const adapter = createStylePlatformAdapter({
      id: 'mini-program',
      styleHandler,
    })

    const transformed = await adapter.transform(createArtifact(), { stage: 'framework-processed' })

    expect(transformRoot).toHaveBeenCalledTimes(1)
    expect(transformed.fragments[0]!.root).not.toBe(handlerResultRoot)
    expect(transformed.fragments[0]!.stage).toBe('framework-processed')
  })
})
