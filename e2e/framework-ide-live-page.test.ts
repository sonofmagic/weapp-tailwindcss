import { describe, expect, it, vi } from 'vitest'
import { readCurrentPageLiveContent, readPageLiveContentRaw } from './frameworkIdeLivePage'

describe('framework IDE live page reader', () => {
  it('combines page content with child elements', async () => {
    const pageElement = {
      attribute: vi.fn().mockResolvedValue('page-root'),
      outerWxml: vi.fn().mockResolvedValue('<page><view>HMR-MARKER</view></page>'),
      text: vi.fn().mockResolvedValue('HMR-MARKER'),
    }
    const page = {
      $: vi.fn().mockResolvedValue(pageElement),
      $$: vi.fn().mockResolvedValue([]),
      data: vi.fn().mockResolvedValue({ ready: true }),
    }

    const content = await readPageLiveContentRaw(page)

    expect(content).toContain('HMR-MARKER')
    expect(content).toContain('[page:data] {"ready":true}')
    expect(page.$$).toHaveBeenCalledTimes(3)
    expect(pageElement.attribute).not.toHaveBeenCalled()
    expect(pageElement.outerWxml).not.toHaveBeenCalled()
  })

  it('finds an HMR marker in a child when the page root has unrelated text', async () => {
    const marker = '__twIdeWatchClass'
    const element = (text: string) => ({
      attribute: vi.fn().mockResolvedValue(''),
      outerWxml: vi.fn().mockResolvedValue(''),
      text: vi.fn().mockResolvedValue(text),
    })
    const page = {
      $: vi.fn().mockResolvedValue(element('page title')),
      $$: vi.fn().mockImplementation(async (selector: string) => selector === 'view' ? [element(marker)] : []),
      data: vi.fn().mockResolvedValue({}),
    }

    await expect(readPageLiveContentRaw(page)).resolves.toContain(marker)
  })

  it('refreshes a stale page handle before reading live content', async () => {
    const element = (text: string) => ({
      text: vi.fn().mockResolvedValue(text),
    })
    const page = (text: string) => ({
      $: vi.fn().mockResolvedValue(element(text)),
      $$: vi.fn().mockResolvedValue([]),
      data: vi.fn().mockResolvedValue({}),
    })
    const stalePage = page('before HMR')
    const currentPage = page('HMR-MARKER')
    const miniProgram = {
      currentPage: vi.fn().mockResolvedValue(currentPage),
    }

    const result = await readCurrentPageLiveContent(miniProgram, stalePage, '/pages/index/index')

    expect(result.page).toBe(currentPage)
    expect(result.content).toContain('HMR-MARKER')
  })
})
