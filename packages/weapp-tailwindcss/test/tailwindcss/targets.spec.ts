import type { CreateTailwindcssPatcherOptions } from '@/tailwindcss/patcher'
import type { InternalUserDefinedOptions, TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('tailwindcss targets', () => {
  afterEach(() => {
    vi.doUnmock('@/tailwindcss/patcher')
    vi.resetModules()
  })

  it('keeps provided tailwindcss basedir when css entry lives in a subfolder', async () => {
    const classList = ['text-green-500']
    type PatchResult = Awaited<ReturnType<TailwindcssPatcherLike['patch']>>
    const patchResult: PatchResult = {
      exposeContext: undefined,
      extendLengthUnits: {
        changed: false,
        code: undefined,
      },
    }

    const createTailwindcssPatcher = vi.fn((options: CreateTailwindcssPatcherOptions) => {
      const stub: TailwindcssPatcherLike = {
        packageInfo: { version: '4.1.0' } as any,
        majorVersion: 4,
        options: options as any,
        patch: vi.fn(async () => patchResult),
        getClassSet: vi.fn(async () => new Set(classList)),
        extract: vi.fn(async () => ({
          classList: [...classList],
          classSet: new Set(classList),
        })),
      }
      return stub
    })

    vi.doMock('@/tailwindcss/patcher', () => ({ createTailwindcssPatcher }))

    const { createTailwindcssPatcherFromContext } = await import('@/context/tailwindcss')
    const workspace = path.resolve('/workspace/project')
    const ctx = {
      tailwindcssBasedir: workspace,
      supportCustomLengthUnitsPatch: undefined,
      tailwindcss: undefined,
      tailwindcssPatcherOptions: undefined,
      cssEntries: ['src/app.css'],
      appType: 'taro',
    } as unknown as InternalUserDefinedOptions

    const patcher = createTailwindcssPatcherFromContext(ctx)

    expect(createTailwindcssPatcher).toHaveBeenCalledTimes(1)
    const options = createTailwindcssPatcher.mock.calls[0][0]
    expect(options.tailwindcss?.v4?.base).toBe(workspace)
    expect(options.tailwindcss?.v4?.cssEntries).toEqual([
      path.join(workspace, 'src', 'app.css'),
    ])
    expect(ctx.cssEntries).toEqual([
      path.join(workspace, 'src', 'app.css'),
    ])

    const extracted = await patcher.extract({})
    expect(Array.from(extracted.classSet)).toEqual(classList)
    expect(extracted.classList).toEqual(classList)

    const patched = await patcher.patch()
    expect(patched).toEqual(patchResult)
  })
})
