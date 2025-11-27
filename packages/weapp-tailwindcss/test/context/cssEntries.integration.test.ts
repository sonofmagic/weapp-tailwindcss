import path from 'node:path'
import { escape } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'

describe('cssEntries integration', () => {
  it('collects class names from nested css entries and rewrites arbitrary classes', async () => {
    const projectRoot = path.resolve(__dirname, '..', 'fixtures', 'tailwind-v4-app')
    const cssEntry = path.join(projectRoot, 'src', 'main.css')

    const ctx = getCompilerContext({
      tailwindcssBasedir: projectRoot,
      cssEntries: [cssEntry],
    })

    await ctx.twPatcher.patch()
    const runtimeSet = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(runtimeSet.size).toBeGreaterThan(0)
    expect(runtimeSet.has('bg-[#00aa55]')).toBe(true)
    const source = 'const cls = \'bg-[#00aa55]\''
    const result = ctx.jsHandler(source, runtimeSet)
    const expectedClass = escape('bg-[#00aa55]')

    expect(result.code).toContain(expectedClass)
    expect(result.code).not.toContain('bg-[#00aa55]')
  })
})
