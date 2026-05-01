import type { Selector, SelectorComponent } from 'lightningcss'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assignNestedSelectors,
  cloneComponent,
  cloneComponents,
  createTypeSelector,
  matchesHiddenNot,
  normalizeNestedSelectors,
  trimCombinators,
} from '@/lightningcss/style-handler/selector-utils'

describe('lightningcss selector utils', () => {
  const originalStructuredClone = globalThis.structuredClone

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalStructuredClone) {
      globalThis.structuredClone = originalStructuredClone
    }
  })

  it('creates type selector components', () => {
    expect(createTypeSelector('view')).toEqual({
      type: 'type',
      name: 'view',
    })
  })

  it('clones selector components with structuredClone when available', () => {
    const component = {
      type: 'pseudo-class',
      kind: 'is',
      selectors: [[createTypeSelector('view')]],
    } satisfies SelectorComponent
    const structuredClone = vi.fn((value: SelectorComponent) => ({ ...value }))
    vi.stubGlobal('structuredClone', structuredClone)

    const cloned = cloneComponent(component)

    expect(structuredClone).toHaveBeenCalledWith(component)
    expect(cloned).toEqual(component)
    expect(cloned).not.toBe(component)
  })

  it('falls back to JSON cloning when structuredClone is unavailable', () => {
    const component = {
      type: 'attribute',
      name: 'hidden',
      operation: { operator: 'equal', value: 'true' },
    } satisfies SelectorComponent
    vi.stubGlobal('structuredClone', undefined)

    const cloned = cloneComponent(component)

    expect(cloned).toEqual(component)
    expect(cloned).not.toBe(component)
  })

  it('clones component lists without reusing component references', () => {
    const list = [createTypeSelector('view'), createTypeSelector('text')]

    const cloned = cloneComponents(list)

    expect(cloned).toEqual(list)
    expect(cloned).not.toBe(list)
    expect(cloned[0]).not.toBe(list[0])
  })

  it('normalizes nested selector shapes', () => {
    const selector = [createTypeSelector('view')]
    const selectorList = [[createTypeSelector('view')], [createTypeSelector('text')]]

    expect(normalizeNestedSelectors(undefined)).toBeUndefined()
    expect(normalizeNestedSelectors(null)).toBeUndefined()
    expect(normalizeNestedSelectors([])).toEqual([])
    expect(normalizeNestedSelectors(selector)).toEqual([selector])
    expect(normalizeNestedSelectors(selectorList)).toBe(selectorList)
    expect(normalizeNestedSelectors(createTypeSelector('view') as unknown as Selector)).toEqual([
      createTypeSelector('view'),
    ])
  })

  it('assigns nested selectors according to the existing target shape', () => {
    const replacement = [[createTypeSelector('text')]]
    const withoutSelectors = createTypeSelector('view') as SelectorComponent & { selectors?: Selector[] }
    const withArray = {
      type: 'pseudo-class',
      kind: 'is',
      selectors: [[createTypeSelector('view')]],
    } as SelectorComponent & { selectors?: Selector[] | Selector | null }
    const withObject = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: { raw: true },
    } as unknown as SelectorComponent & { selectors?: Selector[] | Selector | null }
    const withObjectAndNoReplacement = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: { raw: true },
    } as unknown as SelectorComponent & { selectors?: Selector[] | Selector | null }

    assignNestedSelectors(withoutSelectors, replacement)
    assignNestedSelectors(withArray, replacement)
    assignNestedSelectors(withObject, replacement)

    expect(withoutSelectors).not.toHaveProperty('selectors')
    expect(withArray.selectors).toEqual(replacement)
    expect(withObject.selectors).toEqual(replacement[0])

    assignNestedSelectors(withArray, undefined)
    assignNestedSelectors(withObjectAndNoReplacement, undefined)

    expect(withArray.selectors).toEqual([])
    expect(withObjectAndNoReplacement.selectors).toEqual({ raw: true })
  })

  it('trims leading and trailing combinators', () => {
    const input = [
      { type: 'combinator', value: 'child' },
      createTypeSelector('view'),
      { type: 'combinator', value: 'next-sibling' },
    ] satisfies SelectorComponent[]

    expect(trimCombinators(input)).toEqual([createTypeSelector('view')])
    expect(trimCombinators([createTypeSelector('text')])).toEqual([createTypeSelector('text')])
    expect(trimCombinators(input.slice(0, 1))).toEqual([])
  })

  it('matches hidden and template not pseudo classes', () => {
    const hiddenNot = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: [[{ type: 'attribute', name: 'hidden' }]],
    } satisfies SelectorComponent
    const templateNot = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: [[createTypeSelector('template')]],
    } satisfies SelectorComponent
    const multiSelectorNot = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: [[{ type: 'attribute', name: 'hidden' }], [createTypeSelector('template')]],
    } satisfies SelectorComponent
    const multiNodeNot = {
      type: 'pseudo-class',
      kind: 'not',
      selectors: [[{ type: 'attribute', name: 'hidden' }, createTypeSelector('view')]],
    } satisfies SelectorComponent

    expect(matchesHiddenNot(undefined)).toBe(false)
    expect(matchesHiddenNot(createTypeSelector('view'))).toBe(false)
    expect(matchesHiddenNot({ ...hiddenNot, kind: 'is' })).toBe(false)
    expect(matchesHiddenNot({ ...hiddenNot, selectors: undefined })).toBe(false)
    expect(matchesHiddenNot(multiSelectorNot)).toBe(false)
    expect(matchesHiddenNot(multiNodeNot)).toBe(false)
    expect(matchesHiddenNot(hiddenNot)).toBe(true)
    expect(matchesHiddenNot(templateNot)).toBe(true)
  })
})
