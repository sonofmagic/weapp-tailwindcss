import type { ParserPlugin } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import type { Node as BabelNode } from '@babel/types'
import { describe, expect, it } from 'vitest'
import { parse, traverse } from '@/babel'
import { createTaggedTemplateIgnore } from '@/js/taggedTemplateIgnore'

type PluginList = ParserPlugin[]

function getTagPaths(source: string, plugins: PluginList = []): NodePath<BabelNode>[] {
  const ast = parse(source, {
    sourceType: 'module',
    plugins,
  })

  const paths: NodePath<BabelNode>[] = []
  traverse(ast, {
    TaggedTemplateExpression(path) {
      paths.push(path.get('tag') as NodePath<BabelNode>)
    },
  })

  return paths
}

describe('taggedTemplateIgnore', () => {
  it('matches configured identifiers and caches results', () => {
    const helper = createTaggedTemplateIgnore({ matcher: value => value === 'ignoreMe', names: ['ignoreMe'] })
    const [tagPath] = getTagPaths('ignoreMe`foo`')

    expect(helper.shouldIgnore(tagPath)).toBe(true)
    expect(helper.shouldIgnore(tagPath)).toBe(true)
  })

  it('resolves imports of weappTwIgnore and alias chains', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false, names: ['weappTwIgnore'] })
    const [importAlias, chainedAlias] = getTagPaths([
      'import { weappTwIgnore as imported } from "weapp-tailwindcss/escape"',
      'const chained = imported',
      'imported`foo`',
      'chained`bar`',
    ].join('\n'))

    expect(helper.shouldIgnore(importAlias)).toBe(true)
    expect(helper.shouldIgnore(chainedAlias)).toBe(true)
  })

  it('does not treat plain String.raw aliases as ignored and clears cycle tracking between evaluations', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false, names: ['weappTwIgnore'] })
    const [rawAlias, chained, cycle, importedAlias] = getTagPaths([
      'const rawAlias = String.raw',
      'const chained = rawAlias',
      'rawAlias`foo`',
      'chained`bar`',
      'const a = b',
      'const b = a',
      'a`cycle`',
      'import { weappTwIgnore as imported } from "weapp-tailwindcss/escape"',
      'imported`ok`',
    ].join('\n'))

    expect(helper.shouldIgnore(rawAlias)).toBe(false)
    expect(helper.shouldIgnore(chained)).toBe(false)
    expect(helper.shouldIgnore(cycle)).toBe(false)
    expect(helper.shouldIgnore(importedAlias)).toBe(true)
  })

  it('recognises helper properties on objects and computed lookups', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false, names: ['weappTwIgnore'] })
    const [dotMember, computedMember, rawMember, rawComputed, unrelatedMember] = getTagPaths([
      'const registry = { weappTwIgnore: String.raw }',
      'registry.weappTwIgnore`ok`',
      'registry["weappTwIgnore"]`ok`',
      'String.raw`ok`',
      'String["raw"]`ok`',
      'String.notRaw`no`',
    ].join('\n'))

    expect(helper.shouldIgnore(dotMember)).toBe(true)
    expect(helper.shouldIgnore(computedMember)).toBe(true)
    expect(helper.shouldIgnore(rawMember)).toBe(false)
    expect(helper.shouldIgnore(rawComputed)).toBe(false)
    expect(helper.shouldIgnore(unrelatedMember)).toBe(false)
  })

  it('returns false for unsupported tag expressions', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false, names: ['weappTwIgnore'] })
    const [unsupportedTag] = getTagPaths('(() => String.raw)`nope`')
    expect(helper.shouldIgnore(unsupportedTag)).toBe(false)
  })

  it('reuses effective tag evaluation for wrapped non-null expressions', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false, names: ['weappTwIgnore'] })
    const [wrappedTag] = getTagPaths([
      'import { weappTwIgnore as imported } from "weapp-tailwindcss/escape"',
      'const chained = imported',
      'chained!`foo`',
    ].join('\n'), ['typescript'])

    const effectiveTag = helper.getEffectiveTagPath(wrappedTag)

    expect(effectiveTag.isIdentifier({ name: 'chained' })).toBe(true)
    expect(helper.shouldIgnore(wrappedTag)).toBe(true)
    expect(helper.shouldIgnore(effectiveTag)).toBe(true)
  })

  it('returns false when identifiers are not recognised', () => {
    const helper = createTaggedTemplateIgnore({ matcher: () => false })
    const [unknownTag] = getTagPaths('unknown`foo`')

    expect(helper.shouldIgnore(unknownTag)).toBe(false)
  })
})
