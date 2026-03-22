import fs from 'node:fs/promises'
import path from 'node:path'
import { escape } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'

const repoRoot = path.resolve(__dirname, '../../../..')

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

  it('refreshes script arbitrary values for uni-app-vue3-vite', async () => {
    const projectRoot = path.resolve(repoRoot, 'demo/uni-app-vue3-vite')
    const sourceFile = path.join(projectRoot, 'src/pages/index/index.vue')
    const original = await fs.readFile(sourceFile, 'utf8')
    const previousToken = 'bg-[#123456] shadow-blue-100'
    const nextToken = 'bg-[#4545AB] shadow-blue-100'

    expect(original.includes(previousToken)).toBe(true)
    expect(original.includes(nextToken)).toBe(false)

    const ctx = getCompilerContext({
      tailwindcssBasedir: projectRoot,
      appType: 'uni-app-vite',
    })

    await ctx.twPatcher.patch()
    const baseline = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(baseline.has('bg-[#123456]')).toBe(true)
    expect(baseline.has('bg-[#4545AB]')).toBe(false)
    expect(baseline.has('bg-[#4545ab]')).toBe(false)

    await fs.writeFile(sourceFile, original.replace(previousToken, nextToken), 'utf8')

    try {
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
      await ctx.twPatcher.patch()

      const refreshed = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
      expect(refreshed.has('bg-[#4545AB]') || refreshed.has('bg-[#4545ab]')).toBe(true)

      const source = `import { ref } from 'vue'\nconst cardsColor = ref(['${nextToken}'])`
      const result = ctx.jsHandler(source, refreshed)
      expect(result.code).toMatch(/bg-_b_h4545(?:AB|ab)_B/)
      expect(result.code).not.toContain(`'bg-[#4545AB] shadow-blue-100'`)
    }
    finally {
      await fs.writeFile(sourceFile, original, 'utf8')
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
    }
  })

  it('keeps shorthand hex script classes refreshable for uni-app-vue3-vite', async () => {
    const projectRoot = path.resolve(repoRoot, 'demo/uni-app-vue3-vite')
    const sourceFile = path.join(projectRoot, 'src/pages/index/index.vue')
    const original = await fs.readFile(sourceFile, 'utf8')
    const previousToken = '\'bg-[#fff]\':true'
    const nextToken = '\'bg-[#f00]\':true'

    expect(original.includes(previousToken)).toBe(true)
    expect(original.includes(nextToken)).toBe(false)

    const ctx = getCompilerContext({
      tailwindcssBasedir: projectRoot,
      appType: 'uni-app-vite',
    })

    await ctx.twPatcher.patch()
    const baseline = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(baseline.has('bg-[#fff]')).toBe(true)
    expect(baseline.has('bg-[#f00]')).toBe(false)

    await fs.writeFile(sourceFile, original.replace(previousToken, nextToken), 'utf8')

    try {
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
      await ctx.twPatcher.patch()

      const refreshed = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
      expect(refreshed.has('bg-[#f00]')).toBe(true)

      const source = 'import { ref } from \'vue\'\nconst bgObj = ref({ \'bg-[#f00]\': true })'
      const result = ctx.jsHandler(source, refreshed)
      expect(result.code).toContain(escape('bg-[#f00]'))
      expect(result.code).not.toContain('bg-[#f00]')
    }
    finally {
      await fs.writeFile(sourceFile, original, 'utf8')
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
    }
  })
})
