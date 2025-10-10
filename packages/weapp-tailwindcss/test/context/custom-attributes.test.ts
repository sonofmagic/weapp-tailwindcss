import { describe, expect, it, vi } from 'vitest'
import { toCustomAttributesEntities } from '@/context/custom-attributes'

vi.mock('@/utils', () => ({
  isMap: (value: unknown): value is Map<unknown, unknown> => value instanceof Map,
}))

describe('toCustomAttributesEntities', () => {
  it('converts Map entries to tuple array', () => {
    const customAttributes = new Map<string | RegExp, (string | RegExp)[]>([
      ['*', ['class']],
      [/^van-/, [/class$/]],
    ])

    const entities = toCustomAttributesEntities(customAttributes)

    expect(entities).toEqual([
      ['*', ['class']],
      [/^van-/, [/class$/]],
    ])
  })

  it('converts record entries to tuple array', () => {
    const customAttributes = {
      'view': ['class', 'hover-class'],
      'van-button': [/custom-/],
    }

    const entities = toCustomAttributesEntities(customAttributes)

    expect(entities).toEqual([
      ['view', ['class', 'hover-class']],
      ['van-button', [/custom-/]],
    ])
  })
})
