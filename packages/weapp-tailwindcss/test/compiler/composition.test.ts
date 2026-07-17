import { describe, expect, it } from 'vitest'
import { composeGenerationArtifact, createCssFragment, createGenerationArtifact } from '@/compiler'

const scope = { id: 'global', kind: 'global' as const }

describe('compiler CSS composition', () => {
  it('orders cloned nodes without draining fragment roots', () => {
    const artifact = createGenerationArtifact([
      createCssFragment({
        id: 'utilities',
        kind: 'tailwind',
        css: '.utilities { display: flex; }',
        sourceId: '/src/app.css',
        scope,
        order: 20,
      }),
      createCssFragment({
        id: 'theme',
        kind: 'theme',
        css: ':root { --color-brand: red; }',
        sourceId: '/src/theme.css',
        scope,
        order: 10,
      }),
    ], {
      classSet: new Set(['utilities']),
      rawCandidates: new Set(['utilities']),
      dependencies: [],
      sourceEntries: [],
    })

    const composed = composeGenerationArtifact(artifact)

    expect(composed.css.indexOf(':root')).toBeLessThan(composed.css.indexOf('.utilities'))
    expect(composed.artifact.fragments.find(fragment => fragment.id === 'theme')?.root.nodes).toHaveLength(1)
    expect(composed.artifact.fragments.find(fragment => fragment.id === 'utilities')?.root.nodes).toHaveLength(1)
    expect(artifact.fragments.every(fragment => fragment.root.nodes.length === 1)).toBe(true)

    composed.root.append({ selector: '.composed-only', nodes: [] })
    expect(composed.artifact.fragments.some(fragment => fragment.root.toString().includes('composed-only'))).toBe(false)
  })
})
