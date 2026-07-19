import type { Plugin } from 'vite'
import { access, mkdir, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { WeappTailwindcss } from '@/bundlers/vite'
import { replaceWxml } from '@/wxml'

interface ViteBuildWatcher {
  close: () => Promise<void> | void
  off?: (event: 'event', listener: (event: { code: string, error?: unknown }) => void) => void
  on: (event: 'event', listener: (event: { code: string, error?: unknown }) => void) => void
}

const require = createRequire(import.meta.url)
const tailwindcss4Basedir = path.dirname(require.resolve('tailwindcss4/package.json'))
const createdDirs: string[] = []
const rawCandidate = 'pt-[12rpx]'
const transformedCandidate = replaceWxml(rawCandidate)

function waitForWatchEnd(watcher: ViteBuildWatcher) {
  return new Promise<void>((resolve, reject) => {
    const onEvent = (event: { code: string, error?: unknown }) => {
      if (event.code === 'ERROR') {
        cleanup()
        reject(event.error instanceof Error ? event.error : new Error(String(event.error)))
        return
      }
      if (event.code === 'END') {
        cleanup()
        resolve()
      }
    }
    const cleanup = () => watcher.off?.('event', onEvent)
    watcher.on('event', onEvent)
  })
}

function emitWatchedTemplate(templateFile: string): Plugin {
  return {
    name: 'emit-watched-anonymous-template',
    async buildStart() {
      this.addWatchFile(templateFile)
      try {
        const source = await readFile(templateFile, 'utf8')
        this.emitFile({
          type: 'asset',
          fileName: 'views/card.axml',
          source,
        })
      }
      catch (error) {
        if ((error as { code?: string }).code !== 'ENOENT') {
          throw error
        }
      }
    },
  }
}

async function createFixtureRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-vite-template-delete-'))
  createdDirs.push(root)
  const viewsDir = path.join(root, 'views')
  await mkdir(viewsDir, { recursive: true })
  const cssFile = path.join(root, 'app.css')
  const templateFile = path.join(viewsDir, 'card.axml')
  await Promise.all([
    writeFile(path.join(root, 'app.ts'), 'import "./app.css"\n'),
    writeFile(cssFile, [
      '@import "tailwindcss";',
      '@source "./views/card.axml";',
      '',
    ].join('\n')),
    writeFile(templateFile, `<view class="${rawCandidate}">card</view>\n`),
  ])
  return {
    cssFile,
    root,
    templateFile,
  }
}

describe('bundlers/vite template delete watch', () => {
  afterEach(async () => {
    await Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('removes candidates owned by an anonymous template asset after source deletion', async () => {
    const { cssFile, root, templateFile } = await createFixtureRoot()
    const distCssFile = path.join(root, 'dist/app.css')
    const watcher = await build({
      root,
      logLevel: 'silent',
      plugins: [
        emitWatchedTemplate(templateFile),
        ...WeappTailwindcss({
          appType: 'weapp-vite',
          cssEntries: [cssFile],
          generator: {
            hmr: {
              preserveDeletedCss: false,
            },
          },
          tailwindcssBasedir: tailwindcss4Basedir,
          tailwindcss: {
            packageName: 'tailwindcss4',
            v4: {
              cssEntries: [cssFile],
            },
          },
        }) ?? [],
      ],
      build: {
        minify: false,
        watch: {},
        rollupOptions: {
          input: path.join(root, 'app.ts'),
          output: {
            assetFileNames: '[name].[ext]',
            chunkFileNames: '[name].js',
            entryFileNames: '[name].js',
          },
        },
      },
    }) as ViteBuildWatcher

    try {
      await waitForWatchEnd(watcher)
      expect(await readFile(distCssFile, 'utf8')).toContain(`.${transformedCandidate}`)
      await access(path.join(root, 'dist/views/card.axml'))

      const rebuild = waitForWatchEnd(watcher)
      await unlink(templateFile)
      await rebuild

      expect(await readFile(distCssFile, 'utf8')).not.toContain(`.${transformedCandidate}`)
    }
    finally {
      await watcher.close()
    }
  }, 60_000)
})
