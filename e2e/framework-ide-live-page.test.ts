import { describe, expect, it, vi } from 'vitest'
import { readPageLiveContentRaw } from './frameworkIdeLivePage'

describe('framework IDE live page reader', () => {
  it('uses complete page WXML without traversing every child element', async () => {
    const pageElement = {
      attribute: vi.fn().mockResolvedValue('page-root'),
      outerWxml: vi.fn().mockResolvedValue('<page><view>HMR-MARKER</view></page>'),
      text: vi.fn().mockResolvedValue('HMR-MARKER'),
    }
    const page = {
      $: vi.fn().mockResolvedValue(pageElement),
      $$: vi.fn().mockRejectedValue(new Error('child traversal should not run')),
      data: vi.fn().mockResolvedValue({ ready: true }),
    }

    const content = await readPageLiveContentRaw(page)

    expect(content).toContain('HMR-MARKER')
    expect(content).toContain('[page:data] {"ready":true}')
    expect(page.$$).not.toHaveBeenCalled()
    expect(pageElement.attribute).not.toHaveBeenCalled()
    expect(pageElement.outerWxml).not.toHaveBeenCalled()
  })
})
