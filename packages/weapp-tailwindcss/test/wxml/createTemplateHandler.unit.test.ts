import { beforeEach, describe, expect, it, vi } from 'vitest'

const customTemplateHandler = vi.fn(async (rawSource: string) => rawSource)
const createAttributeMatcher = vi.fn()

vi.mock('@/wxml/custom-attributes', () => ({
  createAttributeMatcher,
  isPropsMatch: vi.fn(),
}))

vi.mock('@/wxml/utils/custom-template', () => ({
  customTemplateHandler,
}))

const { createTemplateHandler } = await import('@/wxml')

describe('createTemplateHandler option reuse', () => {
  beforeEach(() => {
    customTemplateHandler.mockClear()
    createAttributeMatcher.mockClear()
    createAttributeMatcher.mockReturnValue(undefined)
  })

  it('reuses the base options object when runtimeSet is omitted', async () => {
    const jsHandler = vi.fn()
    const handler = createTemplateHandler({
      inlineWxs: true,
      jsHandler,
    })

    await handler('<view class="a"></view>')
    await handler('<view class="b"></view>', {})

    const firstOptions = customTemplateHandler.mock.calls[0]?.[1]
    const secondOptions = customTemplateHandler.mock.calls[1]?.[1]

    expect(firstOptions).toBe(secondOptions)
    expect(firstOptions).toMatchObject({
      inlineWxs: true,
      jsHandler,
    })
  })

  it('reuses the merged options object when runtimeSet is stable', async () => {
    const jsHandler = vi.fn()
    const runtimeSet = new Set(['text-[12px]'])
    const handler = createTemplateHandler({
      jsHandler,
    })

    await handler('<view class="a"></view>', { runtimeSet })
    await handler('<view class="b"></view>', { runtimeSet })

    const firstOptions = customTemplateHandler.mock.calls[0]?.[1]
    const secondOptions = customTemplateHandler.mock.calls[1]?.[1]

    expect(firstOptions).toBe(secondOptions)
    expect(firstOptions).toMatchObject({
      jsHandler,
      runtimeSet,
    })
  })
})
