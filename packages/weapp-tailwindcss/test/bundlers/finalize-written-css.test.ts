import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { ResolvedConfig } from 'vite'
import { cleanFinalWrittenCssAssets } from '@/bundlers/vite/finalize-written-css'

const createdDirs: string[] = []

describe('final written css cleanup', () => {
  afterEach(async () => {
    for (const dir of createdDirs.splice(0)) {
      await import('node:fs/promises').then(({ rm }) => rm(dir, { force: true, recursive: true }))
    }
  })

  it('cleans fallback placeholders from emitted wxss files on disk', async () => {
    const rootDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-finalize-'))
    createdDirs.push(rootDir)
    const outDir = path.join(rootDir, 'dist')
    await mkdir(path.join(outDir, 'pages/index'), { recursive: true })

    const appOrigin = path.join(outDir, 'app-origin.wxss')
    const pageCss = path.join(outDir, 'pages/index/index.wxss')
    await writeFile(appOrigin, 'page:not(#\\#),view:not(#n){color:red}', 'utf8')
    await writeFile(pageCss, '.demo{color:blue}', 'utf8')

    await cleanFinalWrittenCssAssets({
      command: 'build',
      root: rootDir,
      build: {
        outDir: 'dist',
      },
    } as ResolvedConfig, () => {})

    expect(await readFile(appOrigin, 'utf8')).toBe('page,view{color:red}')
    expect(await readFile(pageCss, 'utf8')).toBe('.demo{color:blue}')
  })
})
