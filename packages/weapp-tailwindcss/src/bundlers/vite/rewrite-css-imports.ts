import type { Plugin } from 'vite'
import type { AppType } from '@/types'
import path from 'node:path'
import { vitePluginName } from '@/constants'
import { resolveTailwindcssImport, rewriteTailwindcssImportsInCode } from '../shared/css-imports'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, normalizeTailwindConfigDirectives } from '../shared/generator-css/directives'
import { isSourceStyleRequest } from '../shared/style-requests'
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
  return isSourceStyleRequest(importer) || isCSSRequest(normalized) || normalized.endsWith('/*')
}

interface RewriteCssImportsOptions {
  appType?: AppType | undefined
  getAppType?: (() => AppType | undefined) | undefined
  generateTailwindCss?: ((id: string, code: string, hookContext?: { addWatchFile?: (id: string) => void, emitFile?: (emittedFile: { type: 'asset', fileName: string, source: string }) => string }) => Promise<string | undefined> | string | undefined) | undefined
  shouldOwnTailwindGeneration?: boolean | undefined
  shouldRewrite: boolean
  rootImport?: string | undefined
  weappTailwindcssDirPosix: string
  onTailwindRootCss?: ((id: string, code: string) => Promise<void> | void) | undefined
  onCssSourceTransform?: ((id: string, code: string) => Promise<void> | void) | undefined
  shouldGenerateCss?: ((id: string, code: string) => boolean) | undefined
  shouldDeferGeneration?: ((id: string, code: string) => boolean) | undefined
}

function stripTailwindConfigDirectives(code: string) {
  return code.replace(/^\s*@config\s+(?:"[^"]+"|'[^']+')[^;\n]*;\s*$/gm, '')
}

export function createRewriteCssImportsPlugins(options: RewriteCssImportsOptions): Plugin[] {
  if (!options.shouldRewrite && !options.shouldOwnTailwindGeneration) {
    return []
  }
  const { appType, getAppType, rootImport, shouldOwnTailwindGeneration, weappTailwindcssDirPosix } = options
  const resolveAppType = () => getAppType?.() ?? appType
  return [
    {
      name: `${vitePluginName}:rewrite-css-imports`,
      enforce: 'pre',
      resolveId(id, importer) {
        if (!options.shouldRewrite) {
          return null
        }
        const replacement = resolveTailwindcssImport(id, weappTailwindcssDirPosix, {
          join: joinPosixPath,
          appType: resolveAppType(),
          rootImport,
        })
        if (!replacement) {
          return null
        }
        if (importer && !isCssLikeImporter(importer)) {
          return null
        }
        return replacement
      },
      async transform(this: { addWatchFile?: (id: string) => void, emitFile?: (emittedFile: { type: 'asset', fileName: string, source: string }) => string }, code, id) {
        if (!isCSSRequest(id)) {
          return null
        }
        const file = cleanUrl(id)
        const normalizedCode = hasTailwindRootDirectives(code) || code.includes('@config')
          ? normalizeTailwindConfigDirectives(code, path.dirname(file))
          : code
        await options.onCssSourceTransform?.(id, normalizedCode)
        const hasTailwindRoot = hasTailwindRootDirectives(normalizedCode, { importFallback: true })
        if (hasTailwindRoot) {
          await options.onTailwindRootCss?.(id, normalizedCode)
        }
        const shouldGenerateInPreTransform = !options.shouldDeferGeneration?.(id, normalizedCode)
          && (hasTailwindRoot || options.shouldGenerateCss?.(id, normalizedCode))
        if (options.shouldOwnTailwindGeneration && shouldGenerateInPreTransform) {
          const generatedCss = await options.generateTailwindCss?.(id, normalizedCode, this)
          if (generatedCss !== undefined) {
            return {
              code: generatedCss,
              map: null,
            }
          }
        }

        if (!options.shouldRewrite) {
          if (normalizedCode !== code) {
            return {
              code: normalizedCode,
              map: null,
            }
          }
          return null
        }
        const rewritten = rewriteTailwindcssImportsInCode(normalizedCode, weappTailwindcssDirPosix, {
          join: joinPosixPath,
          appType: resolveAppType(),
          rootImport,
        })
        const nextCode = shouldOwnTailwindGeneration
          ? stripTailwindConfigDirectives(rewritten ?? normalizedCode)
          : rewritten
        if (!nextCode || nextCode === code) {
          return null
        }
        return {
          code: nextCode,
          map: null,
        }
      },
    },
  ]
}

export function hasVitePipelineTailwindGenerationDirective(code: string) {
  return hasTailwindRootDirectives(code) || hasTailwindApplyDirective(code)
}
