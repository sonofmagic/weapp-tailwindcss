import type { JsModuleGraphOptions, UserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const MODULE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']

function resolveWithExtensions(base: string): string | undefined {
  for (const ext of MODULE_EXTENSIONS) {
    const candidate = `${base}${ext}`
    try {
      if (fs.statSync(candidate).isFile()) {
        return candidate
      }
    }
    catch {
      continue
    }
  }
  return undefined
}

function resolveLocalModuleCandidate(base: string): string | undefined {
  try {
    const stat = fs.statSync(base)
    if (stat.isFile()) {
      return base
    }
    if (stat.isDirectory()) {
      const resolvedIndex = resolveWithExtensions(path.join(base, 'index'))
      if (resolvedIndex) {
        return resolvedIndex
      }
    }
  }
  catch {
    // 继续尝试按扩展名补全的逻辑
  }

  if (!path.extname(base)) {
    return resolveWithExtensions(base)
  }
  return undefined
}

export function createGulpModuleGraphOptions(opts: UserDefinedOptions): JsModuleGraphOptions {
  return {
    resolve(specifier, importer) {
      if (!specifier) {
        return undefined
      }
      if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) {
        return undefined
      }
      const normalized = path.resolve(path.dirname(importer), specifier)
      return resolveLocalModuleCandidate(normalized)
    },
    load(id) {
      try {
        return fs.readFileSync(id, 'utf8')
      }
      catch {
        return undefined
      }
    },
    filter(id) {
      const relative = path.relative(process.cwd(), id)
      return opts.jsMatcher?.(relative) === true || opts.wxsMatcher?.(relative) === true
    },
  }
}
