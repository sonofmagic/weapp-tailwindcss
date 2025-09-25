import type { Plugin } from 'vite'
import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'

interface DebugOptions {
  cwd?: string
  log?: boolean
}

export function debugX(options?: DebugOptions): Plugin[] {
  const { cwd = process.cwd(), log = process.env.DEBUG_UNI_APP_X_LOG === 'true' } = options ?? {}

  function n(id: string) {
    const idx = id.indexOf('node_modules')
    if (idx > -1) {
      return id.slice(idx)
    }
    return path.relative(cwd, id)
  }

  function createPlugin(options?: { enforce?: 'pre' | 'post', targetDir?: string }): Plugin {
    const { enforce, targetDir } = defu(options, {
      targetDir: '.debug',
    })
    const prefix = enforce === undefined ? 'normal' : enforce

    return {
      name: `weapp-tailwindcss:debug:${prefix}`,
      enforce,
      async transform(code, id) {
        await fs.outputFile(
          path.join(cwd, targetDir, prefix, n(id)),
          code,
          'utf8',
        )
      },
      async generateBundle(_options, bundle) {
        const bundleKeys = Object.keys(bundle)
        if (log) {
          console.log('generateBundle\n', bundleKeys)
        }
        const dir = `bundle-${prefix}`
        await fs.outputFile(path.join(cwd, targetDir, dir, '_keys.txt'), bundleKeys.sort().join('\n'), 'utf8')
        const tasks: Promise<unknown>[] = []
        for (const file of bundleKeys) {
          const item = bundle[file]
          if (item.type === 'asset') {
            tasks.push(
              fs.outputFile(
                path.join(cwd, targetDir, dir, 'asset', file),
                item.source,
                'utf8',
              ),
            )
          }
          else if (item.type === 'chunk') {
            tasks.push(
              fs.outputFile(
                path.join(cwd, targetDir, dir, 'chunk', file),
                item.code,
                'utf8',
              ),
            )
          }
        }
        await Promise.all(tasks)
      },
    }
  }

  return [
    createPlugin({ enforce: 'pre' }),
    createPlugin(),
    createPlugin({ enforce: 'post' }),
  ]
}
