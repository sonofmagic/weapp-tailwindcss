import type { Plugin } from 'vite'
import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'

export function debugX(options?: { cwd: string }): Plugin[] {
  const { cwd = process.cwd() } = options ?? {}

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
      transform(code, id) {
        fs.outputFileSync(
          path.join(cwd, targetDir, prefix, n(id)),
          code,
          'utf8',
        )
      },
      generateBundle(_options, bundle) {
        const bundleKeys = Object.keys(bundle)
        console.log('generateBundle\n', bundleKeys)
        const dir = `bundle-${prefix}`
        fs.outputFileSync(path.join(cwd, targetDir, dir, '_keys.txt'), bundleKeys.sort().join('\n'), 'utf8')
        for (const file of bundleKeys) {
          const item = bundle[file]
          if (item.type === 'asset') {
            fs.outputFileSync(
              path.join(cwd, targetDir, dir, 'asset', file),
              item.source,
              'utf8',
            )
          }
          else if (item.type === 'chunk') {
            fs.outputFileSync(
              path.join(cwd, targetDir, dir, 'chunk', file),
              item.code,
              'utf8',
            )
          }
        }
      },
    }
  }

  return [
    createPlugin({ enforce: 'pre' }),
    createPlugin(),
    createPlugin({ enforce: 'post' }),
  ]
}
