import type { AppType } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function isRaxWorkspace(appType: AppType | undefined, baseDir: string): boolean {
  if (appType === 'rax') {
    return true
  }
  try {
    const pkgPath = path.join(baseDir, 'package.json')
    if (!existsSync(pkgPath)) {
      return false
    }
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, any>
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    }
    if (deps['rax-app'] || deps.rax) {
      return true
    }
  }
  catch {
    return false
  }
  return false
}

function collectRaxStyleEntries(baseDir: string): string[] {
  const STYLE_CANDIDATES = [
    'src/global.css',
    'src/global.scss',
    'src/global.less',
    'src/global.sass',
    'src/global.styl',
    'src/global.stylus',
  ] as const
  const discovered: string[] = []
  for (const relative of STYLE_CANDIDATES) {
    const candidate = path.resolve(baseDir, relative)
    if (existsSync(candidate)) {
      discovered.push(path.normalize(candidate))
    }
  }
  return discovered
}

export function detectImplicitCssEntries(appType: AppType | undefined, baseDir: string): string[] | undefined {
  const baseCandidates = new Set<string>()
  baseCandidates.add(path.normalize(baseDir))
  const envCandidates = [process.cwd(), process.env.INIT_CWD, process.env.PWD]
  for (const candidate of envCandidates) {
    if (candidate) {
      baseCandidates.add(path.normalize(candidate))
    }
  }

  for (const candidateBase of baseCandidates) {
    if (!isRaxWorkspace(appType, candidateBase)) {
      continue
    }
    const entries = collectRaxStyleEntries(candidateBase)
    if (entries.length) {
      return entries
    }
  }

  return undefined
}
