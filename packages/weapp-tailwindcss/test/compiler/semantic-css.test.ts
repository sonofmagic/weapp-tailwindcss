import { describe, expect, it } from 'vitest'
import { compareArtifactSemantics, createCompilerShadowReport, createCssFragment, createGenerationArtifact } from '@/compiler'

function createArtifact(css: string, options: {
  classes?: string[]
  dependencies?: string[]
  rawCandidates?: string[]
  sourceEntries?: string[]
} = {}) {
  return createGenerationArtifact([
    createCssFragment({
      id: 'app.css:generated',
      kind: 'tailwind',
      css,
      sourceId: '/workspace/src/app.css',
      scope: { id: 'app.css', kind: 'global' },
      stage: 'adapted',
    }),
  ], {
    classSet: new Set(options.classes ?? ['p-4']),
    rawCandidates: new Set(options.rawCandidates ?? ['p-4']),
    dependencies: options.dependencies ?? ['/workspace/tailwind.config.ts'],
    sourceEntries: options.sourceEntries ?? ['/workspace/src/app.css'],
  })
}

describe('artifact semantic comparison', () => {
  it('ignores formatting, comments and unordered collection insertion order', () => {
    const left = createArtifact('/* generated */\n.p-4 { padding: 1rem; }', {
      classes: ['p-4', 'm-2'],
      dependencies: ['b.css', 'a.css'],
    })
    const right = createArtifact('.p-4{padding:1rem}', {
      classes: ['m-2', 'p-4'],
      dependencies: ['a.css', 'b.css'],
    })

    expect(compareArtifactSemantics(left, right)).toMatchObject({
      equal: true,
      differences: [],
      truncated: false,
    })
  })

  it('reports selector, declaration and collection differences with JSONPath locations', () => {
    const left = createArtifact('.p-4 { color: red; padding: 1rem; }', {
      classes: ['p-4'],
    })
    const right = createArtifact('.m-2 { padding: 0.5rem; color: blue !important; }', {
      classes: ['m-2'],
    })

    const comparison = compareArtifactSemantics(left, right)

    expect(comparison.equal).toBe(false)
    expect(comparison.differences).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: '$.classSet[0]', left: 'p-4', right: 'm-2' }),
      expect.objectContaining({ path: '$.fragments[0].root[0].selector', left: '.p-4', right: '.m-2' }),
      expect.objectContaining({ path: '$.fragments[0].root[0].nodes[0].property', left: 'color', right: 'padding' }),
      expect.objectContaining({ path: '$.fragments[0].root[0].nodes[1].important', left: false, right: true }),
    ]))
  })

  it('bounds differences and marks reports as truncated', () => {
    const left = createArtifact('.a { color: red; }', {
      classes: Array.from({ length: 8 }, (_, index) => `left-${index}`),
    })
    const right = createArtifact('.b { color: blue; }', {
      classes: Array.from({ length: 8 }, (_, index) => `right-${index}`),
    })

    const comparison = compareArtifactSemantics(left, right, { maxDifferences: 3 })

    expect(comparison.equal).toBe(false)
    expect(comparison.differences).toHaveLength(3)
    expect(comparison.differences[0]?.path).toBe('$.fragments[0].root[0].selector')
    expect(comparison.truncated).toBe(true)
  })

  it('creates serializable shadow reports without retaining PostCSS roots', () => {
    const graph = createArtifact('.p-4 { padding: 1rem; }')
    const report = createCompilerShadowReport('/workspace/src/app.css', undefined, graph)
    const serialized = JSON.stringify(report)

    expect(report.equal).toBe(false)
    expect(report.legacy).toMatchObject({ present: false, fragments: 0 })
    expect(report.graph).toMatchObject({ present: true, fragments: 1 })
    expect(serialized).toContain('$.fragments[0].id')
    expect(serialized).not.toContain('raws')
  })
})
