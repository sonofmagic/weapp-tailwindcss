import { afterEach, describe, expect, it, vi } from 'vitest'

describe('loadTailwindcss3', () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unmock('node:fs/promises')
  })

  it('throws a helpful error when tailwindcss v3 cannot be found', async () => {
    vi.doMock('node:fs/promises', () => ({
      __esModule: true,
      readdir: vi.fn().mockResolvedValue(['tailwindcss@4.0.0']),
    }))

    const { loadTailwindcss3 } = await import('../scripts/load-tailwindcss3')

    await expect(loadTailwindcss3('/fake/base')).rejects.toThrow(/Tailwind CSS v3/)
  })
})
