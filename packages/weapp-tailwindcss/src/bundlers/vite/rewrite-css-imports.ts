import type { Plugin } from 'vite'
import type { AppType } from '@/types'
import { vitePluginName } from '@/constants'
import { resolveTailwindcssImport, rewriteTailwindcssImportsInCode } from '../shared/css-imports'
import { cleanUrl, isCSSRequest } from './utils'

function joinPosixPath(base: string, subpath: string) {
  if (base.endsWith('/')) {
    return `${base}${subpath}`
  }
  return `${base}/${subpath}`
}

function isCssLikeImporter(importer?: string | null) {
  if (!importer) {
    return false
  }
  const normalized = cleanUrl(importer)
  return isCSSRequest(normalized)
}

interface RewriteCssImportsOptions {
  appType?: AppType
  shouldRewrite: boolean
  weappTailwindcssDirPosix: string
}

export function createRewriteCssImportsPlugins(options: RewriteCssImportsOptions): Plugin[] {
  if (!options.shouldRewrite) {
    return []
  }
  const { appType, weappTailwindcssDirPosix } = options
  return [
    {
      name: `${vitePluginName}:rewrite-css-imports`,
      enforce: 'pre',
      resolveId: {
        order: 'pre',
        handler(id, importer) {
          const replacement = resolveTailwindcssImport(id, weappTailwindcssDirPosix, {
            join: joinPosixPath,
            appType,
          })
          if (!replacement) {
            return null
          }
          if (importer && !isCssLikeImporter(importer)) {
            return null
          }
          return replacement
        },
      },
      transform: {
        order: 'pre',
        handler(code, id) {
          if (!isCSSRequest(id)) {
            return null
          }
          const rewritten = rewriteTailwindcssImportsInCode(code, weappTailwindcssDirPosix, {
            join: joinPosixPath,
            appType,
          })
          if (!rewritten) {
            return null
          }
          return {
            code: rewritten,
            map: null,
          }
        },
      },
    },
  ]
}
