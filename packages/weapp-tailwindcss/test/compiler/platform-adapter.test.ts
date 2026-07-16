import { describe, expect, it } from 'vitest'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
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
})
