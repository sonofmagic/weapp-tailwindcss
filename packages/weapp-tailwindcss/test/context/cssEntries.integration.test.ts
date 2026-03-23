import fs from 'node:fs/promises'
import path from 'node:path'
import { escape } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'

const repoRoot = path.resolve(__dirname, '../../../..')
const HIGH_RISK_ARBITRARY_ADD_TOKENS = [
  'bg-[#000]',
  'px-[432.43px]',
  'w-[calc(100%_-_12px)]',
  'bg-[rgb(12,34,56)]',
  'bg-[var(--primary-color-hex)]',
  'text-[14px]',
] as const
const HIGH_RISK_ARBITRARY_MODIFY_TOKENS = [
  'bg-[#0f0]',
  'px-[256.25px]',
  'w-[calc(100%_-_24px)]',
  'bg-[rgb(98,12,45)]',
  'bg-[var(--primary-color-bg)]',
  'text-[22px]',
] as const

function appendScriptLiteralProbe(source: string, tokens: readonly string[]) {
  const probe = [
    '',
    `const __twArbitraryHotRefresh = ref(${JSON.stringify([...tokens])})`,
    '',
  ].join('\n')
  return source.replace('</script>', `${probe}</script>`)
}

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
    const previousToken = '\'bg-[#999999]\':true'
    const nextToken = '\'bg-[#f00]\':true'

    expect(original.includes(previousToken)).toBe(true)
    expect(original.includes(nextToken)).toBe(false)

    const ctx = getCompilerContext({
      tailwindcssBasedir: projectRoot,
      appType: 'uni-app-vite',
    })

    await ctx.twPatcher.patch()
    const baseline = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(baseline.has('bg-[#999999]')).toBe(true)
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

  it('refreshes high-risk arbitrary script token families for uni-app-vue3-vite', async () => {
    const projectRoot = path.resolve(repoRoot, 'demo/uni-app-vue3-vite')
    const sourceFile = path.join(projectRoot, 'src/pages/index/index.vue')
    const original = await fs.readFile(sourceFile, 'utf8')

    const ctx = getCompilerContext({
      tailwindcssBasedir: projectRoot,
      appType: 'uni-app-vite',
    })

    await ctx.twPatcher.patch()

    await fs.writeFile(sourceFile, appendScriptLiteralProbe(original, HIGH_RISK_ARBITRARY_ADD_TOKENS), 'utf8')

    try {
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
      await ctx.twPatcher.patch()

      const baseline = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
      for (const token of HIGH_RISK_ARBITRARY_ADD_TOKENS) {
        expect(baseline.has(token), `baseline should collect ${token}`).toBe(true)
      }

      const addedSource = `import { ref } from 'vue'\nconst cls = ref(${JSON.stringify([...HIGH_RISK_ARBITRARY_ADD_TOKENS])})`
      const addedResult = ctx.jsHandler(addedSource, baseline)
      for (const token of HIGH_RISK_ARBITRARY_ADD_TOKENS) {
        expect(addedResult.code).toContain(escape(token))
        expect(addedResult.code).not.toContain(token)
      }

      await fs.writeFile(sourceFile, appendScriptLiteralProbe(original, HIGH_RISK_ARBITRARY_MODIFY_TOKENS), 'utf8')
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
      await ctx.twPatcher.patch()

      const refreshed = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
      for (const token of HIGH_RISK_ARBITRARY_MODIFY_TOKENS) {
        expect(refreshed.has(token), `refreshed should collect ${token}`).toBe(true)
      }

      const modifiedSource = `import { ref } from 'vue'\nconst cls = ref(${JSON.stringify([...HIGH_RISK_ARBITRARY_MODIFY_TOKENS])})`
      const modifiedResult = ctx.jsHandler(modifiedSource, refreshed)
      for (const token of HIGH_RISK_ARBITRARY_MODIFY_TOKENS) {
        expect(modifiedResult.code).toContain(escape(token))
        expect(modifiedResult.code).not.toContain(token)
      }
    }
    finally {
      await fs.writeFile(sourceFile, original, 'utf8')
      await ctx.refreshTailwindcssPatcher({ clearCache: true })
    }
  })
})
