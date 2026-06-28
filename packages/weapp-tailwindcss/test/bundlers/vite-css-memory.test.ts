import path from 'node:path'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { describe, expect, it, vi } from 'vitest'
import {
  createViteCssMemory,
  normalizeCssSourceIdentity,
  shouldCollectTransformedSourceCandidates,
} from '@/bundlers/vite/css-memory'

describe('vite css memory', () => {
  it('normalizes css source identities and transform collection requests', () => {
    expect(normalizeCssSourceIdentity('/src/App.vue?vue&type=style&index=2&lang.css#hash')).toBe('/src/App.vue?type=style&index=2')
    expect(normalizeCssSourceIdentity('/src/app.css?used')).toBe('/src/app.css')
    expect(shouldCollectTransformedSourceCandidates('/src/App.vue?vue&type=style')).toBe(false)
    expect(shouldCollectTransformedSourceCandidates('/src/app.ts?raw')).toBe(true)
    expect(shouldCollectTransformedSourceCandidates('/src/app.ts')).toBe(true)
  })

  it('remembers, refreshes, and prunes css sources', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-css-memory-'))
    await mkdir(path.join(root, 'src'), { recursive: true })
    const cssFile = path.join(root, 'src/app.css')
    const vueFile = path.join(root, 'src/App.vue')
    await writeFile(cssFile, '.from-file{color:red}')
    await writeFile(vueFile, '<template></template><style>.a{color:red}</style><style>.b{color:blue}</style>')
    const debug = vi.fn()
    const candidateSources = new Map<string, string>()
    const memory = createViteCssMemory({
      debug,
      getSourceCandidateSource: file => candidateSources.get(file),
    })

    memory.rememberKnownSfcSource(vueFile, '<style>.cached{color:red}</style>')
    memory.rememberCssSource({
      outputFile: 'app.wxss',
      rawSource: '.old{color:black}',
      sourceFile: cssFile,
    }, 'sig-1')

    expect(memory.getRememberedCssSignature('app.wxss')).toBe('sig-1')
    expect(memory.getKnownSfcSource(vueFile)).toContain('.cached')

    await memory.refreshRememberedCssSourceByCurrentFile(cssFile)
    expect(memory.getRememberedCssSourceEntry('app.wxss')?.rawSource).toBe('.from-file{color:red}')
    expect(memory.getRememberedCssSignature('app.wxss')).toBeUndefined()

    memory.rememberCssSource({
      outputFile: 'page.wxss',
      rawSource: '.page-old{color:black}',
      sourceFile: `${vueFile}?vue&type=style&index=1&lang.css`,
    })
    candidateSources.set(vueFile, '<style>.first{}</style><style>.second{}</style>')
    await memory.refreshRememberedCssSourceByCurrentFile(vueFile)
    expect(memory.getRememberedCssSourceEntry('page.wxss')?.rawSource).toBe('.second{}')

    memory.setRememberedCssSignature('page.wxss', 'sig-2')
    expect(memory.getRememberedCssSignature('page.wxss')).toBe('sig-2')

    memory.prune({
      activeFiles: new Set(['page.wxss']),
      activeKnownSfcFiles: new Set([vueFile]),
    })
    expect(memory.getRememberedCssSourceEntry('app.wxss')).toBeUndefined()
    expect(memory.getRememberedCssSourceEntry('page.wxss')).toBeTruthy()
    expect(memory.getStats().rememberedCssSources).toBe(1)
  })

  it('refreshes remembered entries directly and reports missing sources', async () => {
    const debug = vi.fn()
    const memory = createViteCssMemory({
      debug,
      getSourceCandidateSource: () => undefined,
    })
    const remembered = {
      outputFile: 'missing.wxss',
      rawSource: '.old{}',
      sourceFile: '/not-found/app.css',
    }

    memory.rememberCssSource(remembered)

    await expect(memory.refreshRememberedCssSource(remembered)).resolves.toBeUndefined()
    expect(debug).toHaveBeenCalledWith(
      'refresh remembered css source before bundle replay skipped: missing cached source for %s',
      '/not-found/app.css',
    )
    expect(memory.getKnownCssSource('/not-found/app.css')).toBeUndefined()
  })

  it('refreshes remembered sfc entries with all style blocks and prunes stale known sfc files', async () => {
    const debug = vi.fn()
    const candidateSources = new Map<string, string>()
    const memory = createViteCssMemory({
      debug,
      getSourceCandidateSource: file => candidateSources.get(file),
    })
    const sfcFile = '/project/src/App.vue'
    const remembered = {
      outputFile: 'app.wxss',
      rawSource: '.old{}',
      sourceFile: sfcFile,
    }

    memory.rememberKnownSfcSource(`${sfcFile}?vue&type=script`, '<style>.ignored{}</style>')
    expect(memory.getKnownSfcSource(sfcFile)).toBeUndefined()

    memory.rememberCssSource(remembered, 'sig')
    candidateSources.set(sfcFile, '<template></template><style>.a{}</style><style>.b{}</style>')

    const refreshed = await memory.refreshRememberedCssSource(remembered)
    expect(refreshed?.rawSource).toBe('.a{}\n.b{}')
    expect(memory.getRememberedCssSignature('app.wxss')).toBeUndefined()

    memory.rememberKnownSfcSource(sfcFile, '<style>.known{}</style>')
    candidateSources.clear()
    expect(memory.getKnownSfcSource(sfcFile)).toContain('.known')
    memory.prune({
      activeFiles: new Set(['app.wxss']),
      activeKnownSfcFiles: new Set(['/project/src/Other.vue']),
    })
    expect(memory.getKnownSfcSource(sfcFile)).toBeUndefined()
  })

  it('logs missing current file refresh sources and keeps unrelated requests untouched', async () => {
    const debug = vi.fn()
    const memory = createViteCssMemory({
      debug,
      getSourceCandidateSource: () => undefined,
    })

    memory.rememberCssSource({
      outputFile: 'page.wxss',
      rawSource: '.old{}',
      sourceFile: '/project/src/Page.vue?vue&type=style&index=3',
    })
    await memory.refreshRememberedCssSourceByCurrentFile('/project/src/Page.vue')

    expect(debug).toHaveBeenCalledWith(
      'refresh remembered css source skipped: missing cached source for %s',
      '/project/src/Page.vue',
    )

    memory.rememberCssSource({
      outputFile: 'script.wxss',
      rawSource: '.old{}',
      sourceFile: '/project/src/page.ts',
    })
    await memory.refreshRememberedCssSourceByCurrentFile('/project/src/page.ts')
    expect(memory.getRememberedCssSourceEntry('script.wxss')?.rawSource).toBe('.old{}')
  })
})
