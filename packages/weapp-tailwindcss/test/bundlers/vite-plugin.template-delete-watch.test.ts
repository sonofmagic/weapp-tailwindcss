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
const tailwindcssBasedir = path.dirname(require.resolve('tailwindcss/package.json'))
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

function emitWatchedTemplate(templateFile: string, templateOutput: string): Plugin {
  return {
    name: 'emit-watched-anonymous-template',
    async buildStart() {
      this.addWatchFile(templateFile)
      try {
        const source = await readFile(templateFile, 'utf8')
        this.emitFile({
          type: 'asset',
          fileName: templateOutput,
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

async function createFixtureRoot(explicitSource: boolean, extension: string) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-vite-template-delete-'))
  createdDirs.push(root)
  const viewsDir = path.join(root, 'views')
  await mkdir(viewsDir, { recursive: true })
  const cssFile = path.join(root, 'app.css')
  const templateOutput = `views/card.${extension}`
  const templateFile = path.join(viewsDir, `card.${extension}`)
  await Promise.all([
    writeFile(path.join(root, 'app.ts'), 'import "./app.css"\n'),
    writeFile(cssFile, [
      '@import "tailwindcss";',
      explicitSource ? `@source "./${templateOutput}";` : '',
      '',
    ].join('\n')),
    writeFile(templateFile, `<view class="${rawCandidate}">card</view>\n`),
  ])
  return {
    cssFile,
    root,
    templateFile,
    templateOutput,
  }
}

describe('bundlers/vite template delete watch', () => {
  afterEach(async () => {
    await Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

  it.each([true, false].flatMap(explicit => ['axml', 'qxml'].map(extension => ({ explicit, extension }))))('removes anonymous $extension candidates with explicit source=$explicit', async ({ explicit, extension }) => {
    const { cssFile, root, templateFile, templateOutput } = await createFixtureRoot(explicit, extension)
    const distCssFile = path.join(root, 'dist/app.css')
    let emittedStyles = new Map<string, string>()
    const watcher = await build({
      root,
      logLevel: 'silent',
      plugins: [
        emitWatchedTemplate(templateFile, templateOutput),
        ...WeappTailwindcss({
          appType: 'weapp-vite',
          cssEntries: [cssFile],
          generator: {
            hmr: {
              preserveDeletedCss: false,
            },
          },
          tailwindcssBasedir,
          tailwindcss: {
            packageName: 'tailwindcss',
            v4: {
              cssEntries: [cssFile],
            },
          },
        }) ?? [],
        {
          name: 'inspect-emitted-style-identity',
          generateBundle: {
            order: 'post',
            handler(_options, bundle) {
              emittedStyles = new Map(Object.entries(bundle).flatMap(([file, output]) =>
                output.type === 'asset' && /\.(?:css|wxss|acss)$/.test(file) ? [[file, String(output.source)]] : [],
              ))
            },
          },
        },
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
      const emittedTemplate = path.join(root, 'dist', templateOutput)
      await access(emittedTemplate)
      expect(await readFile(emittedTemplate, 'utf8')).toContain(transformedCandidate)

      const rebuild = waitForWatchEnd(watcher)
      await unlink(templateFile)
      await rebuild

      expect([...emittedStyles.keys()]).toEqual(['app.css'])
      for (const css of emittedStyles.values()) {
        expect(css).not.toContain(`.${transformedCandidate}`)
      }
      expect(await readFile(distCssFile, 'utf8')).not.toContain(`.${transformedCandidate}`)
    }
    finally {
      await watcher.close()
    }
  }, 60_000)
})
