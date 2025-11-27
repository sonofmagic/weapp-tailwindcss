import type { TailwindcssPatchOptions } from 'tailwindcss-patch'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { normalizeOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import { parse as parseYaml } from 'yaml'
import { clearTailwindcssPatcherCache } from '@/context'
import { findWorkspaceRoot } from '@/context/workspace'
import { logger } from '@/logger'
import { getTailwindcssPackageInfo } from '@/tailwindcss'
import { createPatchTargetRecorder, logTailwindcssTarget } from '@/tailwindcss/targets'

interface WorkspacePatchOptions {
  cwd: string | undefined
  clearCache?: boolean
  recordTarget?: boolean
}

interface WorkspacePatchResult {
  dir: string
  name?: string
  status: 'patched' | 'skipped' | 'failed'
  message?: string
}

function tryReadJson<T extends Record<string, any>>(file: string): T | undefined {
  try {
    const content = readFileSync(file, 'utf8')
    return JSON.parse(content) as T
  }
  catch {
    return undefined
  }
}

function parseWorkspaceGlobsFromPackageJson(workspaceRoot: string) {
  const pkgJsonPath = path.join(workspaceRoot, 'package.json')
  const pkg = tryReadJson<{ workspaces?: string[] | { packages?: string[] } }>(pkgJsonPath)
  if (!pkg?.workspaces) {
    return []
  }
  if (Array.isArray(pkg.workspaces)) {
    return pkg.workspaces.filter(Boolean)
  }
  if (Array.isArray(pkg.workspaces.packages)) {
    return pkg.workspaces.packages.filter(Boolean)
  }
  return []
}

function parseWorkspaceGlobsFromWorkspaceFile(workspaceRoot: string) {
  const workspaceFile = path.join(workspaceRoot, 'pnpm-workspace.yaml')
  if (!existsSync(workspaceFile)) {
    return []
  }
  try {
    const parsed = parseYaml(readFileSync(workspaceFile, 'utf8')) as { packages?: string[] } | undefined
    return Array.isArray(parsed?.packages) ? parsed!.packages.filter(Boolean) : []
  }
  catch {
    return []
  }
}

function parseImportersFromLock(workspaceRoot: string) {
  const lockPath = path.join(workspaceRoot, 'pnpm-lock.yaml')
  if (!existsSync(lockPath)) {
    return []
  }
  try {
    const parsed = parseYaml(readFileSync(lockPath, 'utf8')) as { importers?: Record<string, unknown> } | undefined
    const importers = parsed?.importers
    if (!importers) {
      return []
    }
    return Object.keys(importers).map((key) => {
      if (!key || key === '.') {
        return workspaceRoot
      }
      return path.join(workspaceRoot, key)
    })
  }
  catch {
    return []
  }
}

async function resolveWorkspacePackageDirs(workspaceRoot: string) {
  const dirs = new Set<string>()
  for (const importerDir of parseImportersFromLock(workspaceRoot)) {
    dirs.add(path.normalize(importerDir))
  }

  if (!dirs.size) {
    let globs = parseWorkspaceGlobsFromWorkspaceFile(workspaceRoot)
    if (!globs.length) {
      globs = parseWorkspaceGlobsFromPackageJson(workspaceRoot)
    }
    if (globs.length > 0) {
      const patterns = globs.map((pattern) => {
        const normalized = pattern.replace(/\\/g, '/').replace(/\/+$/, '')
        return normalized.endsWith('package.json') ? normalized : `${normalized}/package.json`
      })
      const packageJsonFiles = await fg(patterns, {
        cwd: workspaceRoot,
        absolute: true,
        onlyFiles: true,
        unique: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
      })
      for (const file of packageJsonFiles) {
        dirs.add(path.normalize(path.dirname(file)))
      }
    }
  }

  const rootPkg = path.join(workspaceRoot, 'package.json')
  if (existsSync(rootPkg)) {
    dirs.add(path.normalize(workspaceRoot))
  }

  return [...dirs]
}

function createWorkspacePatcher(cwd: string) {
  const normalized = normalizeOptions({
    cwd,
  } as TailwindcssPatchOptions)
  return new TailwindcssPatcher(normalized)
}

function formatDisplayName(workspaceRoot: string, dir: string, name?: string) {
  const relative = path.relative(workspaceRoot, dir) || '.'
  return name ? `${name} (${relative})` : relative
}

export async function patchWorkspace(options: WorkspacePatchOptions) {
  const cwd = options.cwd ?? process.cwd()
  const workspaceRoot = findWorkspaceRoot(cwd) ?? cwd
  const packageDirs = await resolveWorkspacePackageDirs(workspaceRoot)
  if (packageDirs.length === 0) {
    logger.warn('未在 %s 检测到 workspace 包，已跳过批量 patch。', workspaceRoot)
    return
  }

  const results: WorkspacePatchResult[] = []

  for (const dir of packageDirs) {
    const pkgJsonPath = path.join(dir, 'package.json')
    const pkgJson = tryReadJson<{ name?: string }>(pkgJsonPath)
    const displayName = formatDisplayName(workspaceRoot, dir, pkgJson?.name)
    const tailwindInfo = getTailwindcssPackageInfo({ paths: [dir] })
    if (!tailwindInfo?.rootPath) {
      results.push({
        dir,
        name: pkgJson?.name,
        status: 'skipped',
        message: 'tailwindcss 未安装，已跳过。',
      })
      logger.info('[workspace] 跳过 %s（tailwindcss 未安装）。', displayName)
      continue
    }

    try {
      const patcher = createWorkspacePatcher(dir)
      if (options.clearCache) {
        await clearTailwindcssPatcherCache(patcher, { removeDirectory: true })
      }
      const recorder = createPatchTargetRecorder(dir, patcher, {
        source: 'cli',
        cwd: dir,
        recordTarget: options.recordTarget !== false,
        alwaysRecord: true,
      })
      if (recorder?.message) {
        logger.info('[workspace] %s %s', displayName, recorder.message)
      }
      logTailwindcssTarget('cli', patcher, dir)
      await patcher.patch()
      if (recorder?.onPatched) {
        await recorder.onPatched()
      }
      results.push({
        dir,
        name: pkgJson?.name,
        status: 'patched',
        message: '已完成 patch。',
      })
      logger.success('[workspace] 已补丁 %s', displayName)
    }
    catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      const suggestion = `请在 ${dir} 运行 "weapp-tw patch --cwd ${dir}".`
      const message = `${reason}，${suggestion}`
      results.push({
        dir,
        name: pkgJson?.name,
        status: 'failed',
        message,
      })
      logger.error('[workspace] 补丁失败 %s：%s', displayName, message)
    }
  }

  const patched = results.filter(result => result.status === 'patched').length
  const skipped = results.filter(result => result.status === 'skipped').length
  const failed = results.filter(result => result.status === 'failed').length

  logger.info('[workspace] 汇总：已补丁 %d，跳过 %d，失败 %d', patched, skipped, failed)
}
