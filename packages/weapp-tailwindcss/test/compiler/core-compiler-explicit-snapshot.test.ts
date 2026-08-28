import { describe, expect, it, vi } from 'vitest'

const ensureRuntimeClassSet = vi.fn()

vi.mock('@/tailwindcss/runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/tailwindcss/runtime')>()
  return {
    ...actual,
    ensureRuntimeClassSet,
  }
})

describe('createCompiler explicit snapshot mode', () => {
  it('does not collect the runtime classSet during CSS, template, or JS transforms', async () => {
    const { createCompiler } = await import('@/core')
    const compiler = createCompiler()
    const snapshot = compiler.createSnapshot({
      classSet: ['w-[10px]'],
      id: 'external-tailwind-chain',
      revision: 7,
    })

    await compiler.transformCss('.w-\\[10px\\] { width: 10px }', snapshot)
    await compiler.transformTemplate('<view class="w-[10px]" />', snapshot)
    await compiler.transformJavaScript('const value = "w-[10px]"', snapshot)

    expect(ensureRuntimeClassSet).not.toHaveBeenCalled()
    await compiler.dispose()
  })
})

