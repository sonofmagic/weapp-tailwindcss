import { beforeEach, describe, expect, it, vi } from 'vitest'

const createTailwindcssPatcherStub = vi.fn(() => Symbol('patcher'))
const defuOverrideArrayStub = vi.fn(() => Symbol('merged'))

vi.mock('@/tailwindcss', () => ({
  createTailwindcssPatcher: createTailwindcssPatcherStub,
}))

vi.mock('@/utils', () => ({
  defuOverrideArray: defuOverrideArrayStub,
}))

describe('createTailwindcssPatcherFromContext', () => {
  beforeEach(() => {
    createTailwindcssPatcherStub.mockClear()
    defuOverrideArrayStub.mockClear()
  })

  it('merges options and enables default length unit patch', async () => {
    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')

    const ctx = {
      tailwindcssBasedir: '/root/project',
      supportCustomLengthUnitsPatch: undefined,
      tailwindcss: { content: ['src/**/*.{js,ts}'] },
      tailwindcssPatcherOptions: { apply: [] },
      cssEntries: ['src/index.css'],
      appType: 'mpx',
    } as unknown as import('@/types').InternalUserDefinedOptions

    const result = createTailwindcssPatcherFromContext(ctx)

    expect(result).toEqual(createTailwindcssPatcherStub.mock.results[0]?.value)
    expect(defuOverrideArrayStub).toHaveBeenCalledWith(ctx.tailwindcss, {
      v4: {
        base: ctx.tailwindcssBasedir,
        cssEntries: ctx.cssEntries,
      },
      version: 4,
    })
    expect(createTailwindcssPatcherStub).toHaveBeenCalledWith({
      basedir: ctx.tailwindcssBasedir,
      cacheDir: 'node_modules/tailwindcss-patch/.cache',
      supportCustomLengthUnitsPatch: true,
      tailwindcss: defuOverrideArrayStub.mock.results[0]?.value,
      tailwindcssPatcherOptions: ctx.tailwindcssPatcherOptions,
    })
  })

  it('keeps custom length unit configuration and omits cacheDir for non-mpx apps', async () => {
    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')

    const ctx = {
      tailwindcssBasedir: '/another',
      supportCustomLengthUnitsPatch: { units: { rem: { denominator: 10 } } },
      tailwindcss: { content: ['other/**/*'] },
      tailwindcssPatcherOptions: { apply: ['foo'] },
      cssEntries: undefined,
      appType: 'native',
    } as unknown as import('@/types').InternalUserDefinedOptions

    createTailwindcssPatcherFromContext(ctx)
    const lastMerged = defuOverrideArrayStub.mock.results[defuOverrideArrayStub.mock.results.length - 1]?.value

    expect(createTailwindcssPatcherStub).toHaveBeenCalledWith({
      basedir: ctx.tailwindcssBasedir,
      cacheDir: undefined,
      supportCustomLengthUnitsPatch: ctx.supportCustomLengthUnitsPatch,
      tailwindcss: lastMerged,
      tailwindcssPatcherOptions: ctx.tailwindcssPatcherOptions,
    })
  })

  it('respects explicitly provided tailwindcss version', async () => {
    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')

    const ctx = {
      tailwindcssBasedir: '/root/project',
      supportCustomLengthUnitsPatch: undefined,
      tailwindcss: { version: 3, content: [] },
      tailwindcssPatcherOptions: {},
      cssEntries: ['src/index.css'],
      appType: 'mpx',
    } as unknown as import('@/types').InternalUserDefinedOptions

    createTailwindcssPatcherFromContext(ctx)

    expect(defuOverrideArrayStub).toHaveBeenCalledWith(ctx.tailwindcss, {
      v4: {
        base: ctx.tailwindcssBasedir,
        cssEntries: ctx.cssEntries,
      },
    })
  })
})
