import type { Plugin } from 'vite'
import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'

interface DebugOptions {
  cwd?: string
  log?: boolean
}

const QUERY_HASH_RE = /[?#].*$/u
const INVALID_FS_CHARS_RE = /[<>:"|?*\0]/g
const VIRTUAL_MODULE_PREFIX = '\u0000'

export function debugX(options?: DebugOptions): Plugin[] {
  const { cwd = process.cwd(), log = process.env.DEBUG_UNI_APP_X_LOG === 'true' } = options ?? {}

  function stripQueryAndHash(id: string) {
    return id.replace(QUERY_HASH_RE, '')
  }

  function replaceVirtualPrefix(id: string) {
    return id.split(VIRTUAL_MODULE_PREFIX).join('virtual/')
  }

  function toSafeRelativePath(id: string) {
    const withoutQuery = stripQueryAndHash(id)
    const devirtualized = replaceVirtualPrefix(withoutQuery)
    const normalized = path.normalize(devirtualized)
    const nodeModulesIndex = normalized.indexOf('node_modules')
    let candidate: string
    if (nodeModulesIndex > -1) {
      candidate = normalized.slice(nodeModulesIndex)
    }
    else if (path.isAbsolute(normalized)) {
      candidate = path.relative(cwd, normalized)
    }
    else {
      candidate = normalized
    }

    const sanitized = candidate
      .replace(/\\/g, '/')
      .replace(INVALID_FS_CHARS_RE, '_')
    const segments = sanitized
      .split('/')
      .filter(segment => segment && segment !== '.' && segment !== '..')

    return segments.join('/') || 'virtual-module'
  }

  function n(id: string) {
    return toSafeRelativePath(id)
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
                path.join(cwd, targetDir, dir, 'asset', n(file)),
                item.source,
                'utf8',
              ),
            )
          }
          else if (item.type === 'chunk') {
            tasks.push(
              fs.outputFile(
                path.join(cwd, targetDir, dir, 'chunk', n(file)),
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
