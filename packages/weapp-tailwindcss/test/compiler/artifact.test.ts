import { describe, expect, it } from 'vitest'
import { AssetEmissionPlan, cloneGenerationArtifact, composeGenerationArtifact, createCssFragment, createGenerationArtifact, planSourceScopes } from '@/compiler'

const scope = { id: 'global', kind: 'global' as const }

describe('compiler artifact', () => {
  it('composes fragments by explicit order', () => {
    const artifact = createGenerationArtifact([
      createCssFragment({
        id: 'utilities',
        kind: 'tailwind',
        css: '.p-4 { padding: 1rem; }',
        sourceId: '/src/app.css',
        scope,
        order: 20,
      }),
      createCssFragment({
        id: 'theme',
        kind: 'theme',
        css: ':root { --spacing: .25rem; }',
        sourceId: '/src/app.css',
        scope,
        order: 10,
      }),
    ], {
      classSet: new Set(['p-4']),
      rawCandidates: new Set(['p-4']),
      dependencies: ['/src/app.css'],
      sourceEntries: ['/src/**/*.vue'],
    })

    const result = composeGenerationArtifact(artifact)

    expect(result.css.indexOf(':root')).toBeLessThan(result.css.indexOf('.p-4'))
  })

  it('does not share mutable roots between clones', () => {
    const artifact = createGenerationArtifact([
      createCssFragment({
        id: 'utilities',
        kind: 'tailwind',
        css: '.p-4 { padding: 1rem; }',
        sourceId: '/src/app.css',
        scope,
      }),
    ], {
      classSet: new Set(['p-4']),
      rawCandidates: new Set(['p-4']),
      dependencies: [],
      sourceEntries: [],
    })
    const cloned = cloneGenerationArtifact(artifact)
    cloned.fragments[0]!.root.removeAll()

    expect(artifact.fragments[0]!.root.toString()).toContain('.p-4')
  })

  it('keeps scope and emission ownership explicit', () => {
    const artifact = createGenerationArtifact([
      createCssFragment({
        id: 'utilities',
        kind: 'tailwind',
        css: '.p-4 { padding: 1rem; }',
        sourceId: '/src/app.css',
        scope,
      }),
    ], {
      classSet: new Set(['p-4']),
      rawCandidates: new Set(['p-4']),
      dependencies: [],
      sourceEntries: [],
    })
    const scopes = planSourceScopes([
      { id: 'app-css', kind: 'css', scope },
      { id: 'app-template', kind: 'template', scope },
    ])
    const emissions = new AssetEmissionPlan()
    emissions.upsert('dist/app.css', artifact)
    const emitted = emissions.get('dist/app.css')!
    emitted.fragments[0]!.root.removeAll()

    expect(scopes).toHaveLength(1)
    expect(scopes[0]?.nodes).toHaveLength(2)
    expect(emissions.get('dist/app.css')?.fragments[0]?.root.toString()).toContain('.p-4')
  })
})
