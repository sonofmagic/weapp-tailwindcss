import type { TailwindcssPatcherLike } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'

const PATCH_INFO_FILENAME = 'tailwindcss-target.json'
const PATCH_INFO_CACHE_RELATIVE_PATH = path.join('node_modules', '.cache', 'weapp-tailwindcss', PATCH_INFO_FILENAME)
const PATCH_INFO_LEGACY_RELATIVE_PATH = path.join('.tw-patch', PATCH_INFO_FILENAME)
const loggedInvalidPatchRecords = new Set<string>()

interface PatchTargetRecord {
  tailwindPackagePath: string
  packageVersion?: string
  recordedAt: string
  source: 'cli' | 'runtime' | string
  tailwindcssBasedir?: string
}

interface PatchTargetRecordResult {
  baseDir: string
  path: string
  record: PatchTargetRecord
}

function formatRelativeToBase(targetPath: string, baseDir?: string) {
  if (!baseDir) {
    return path.normalize(targetPath)
  }
  const relative = path.relative(baseDir, targetPath)
  if (!relative || relative === '.') {
    return '.'
  }
  if (relative.startsWith('..')) {
    return path.normalize(targetPath)
  }
  return path.join('.', relative)
}

function getRecordFilePath(baseDir: string) {
  return path.join(baseDir, PATCH_INFO_CACHE_RELATIVE_PATH)
}

function getRecordFileCandidates(baseDir: string) {
  return [
    path.join(baseDir, PATCH_INFO_CACHE_RELATIVE_PATH),
    path.join(baseDir, PATCH_INFO_LEGACY_RELATIVE_PATH),
  ]
}

export function logTailwindcssTarget(
  kind: 'cli' | 'runtime',
  patcher: TailwindcssPatcherLike | undefined,
  baseDir?: string,
) {
  const packageInfo = patcher?.packageInfo
  const label = kind === 'cli' ? 'weapp-tw patch' : 'tailwindcss-patcher'
  if (!packageInfo?.rootPath) {
    logger.warn(
      '%s 未找到 Tailwind CSS 依赖，请检查在 %s 是否已安装 tailwindcss',
      label,
      baseDir ?? process.cwd(),
    )
    return
  }
  const displayPath = formatRelativeToBase(packageInfo.rootPath, baseDir)
  const version = packageInfo.version ? ` (v${packageInfo.version})` : ''
  logger.info('%s 绑定 Tailwind CSS -> %s%s', label, displayPath, version)
}

function warnInvalidPatchTargetRecord(baseDir: string, recordPath: string, reason: string) {
  const normalizedPath = path.normalize(recordPath)
  if (loggedInvalidPatchRecords.has(normalizedPath)) {
    return
  }
  loggedInvalidPatchRecords.add(normalizedPath)
  const fileDisplay = formatRelativeToBase(normalizedPath, baseDir)
  const baseDisplay = formatRelativeToBase(path.normalize(baseDir), process.cwd())
  const reasonMessage = reason ? `：${reason}` : ''
  logger.warn(
    `检测到损坏的 Tailwind CSS 目标记录 ${fileDisplay}${reasonMessage}。请在 ${baseDisplay} 重新执行 "weapp-tw patch --record-target" 或删除该文件后再运行。`,
  )
}

function readPatchTargetRecord(baseDir?: string): PatchTargetRecordResult | undefined {
  if (!baseDir) {
    return undefined
  }
  const normalizedBase = path.normalize(baseDir)
  for (const recordPath of getRecordFileCandidates(normalizedBase)) {
    if (!existsSync(recordPath)) {
      continue
    }
    try {
      const content = readFileSync(recordPath, 'utf8')
      const parsed = JSON.parse(content) as PatchTargetRecord
      if (!parsed || typeof parsed.tailwindPackagePath !== 'string') {
        warnInvalidPatchTargetRecord(normalizedBase, recordPath, '缺少 tailwindPackagePath 字段')
        continue
      }
      return {
        baseDir: normalizedBase,
        path: recordPath,
        record: parsed,
      }
    }
    catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      warnInvalidPatchTargetRecord(normalizedBase, recordPath, reason)
      continue
    }
  }
  return undefined
}

export async function saveCliPatchTargetRecord(
  baseDir: string | undefined,
  patcher: TailwindcssPatcherLike | undefined,
) {
  if (!baseDir || !patcher?.packageInfo?.rootPath) {
    return undefined
  }
  const normalizedBase = path.normalize(baseDir)
  const record: PatchTargetRecord = {
    tailwindPackagePath: path.normalize(patcher.packageInfo.rootPath),
    packageVersion: patcher.packageInfo.version,
    recordedAt: new Date().toISOString(),
    source: 'cli',
    tailwindcssBasedir: normalizedBase,
  }
  const recordPath = getRecordFilePath(normalizedBase)
  try {
    await mkdir(path.dirname(recordPath), { recursive: true })
    await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    return recordPath
  }
  catch (error) {
    logger.debug('failed to persist patch target record %s: %O', recordPath, error)
    return undefined
  }
}

function findPatchTargetRecord(baseDir?: string): PatchTargetRecordResult | undefined {
  const visited = new Set<string>()
  const fallback = baseDir ?? process.cwd()
  let current = path.resolve(fallback)
  while (!visited.has(current)) {
    const record = readPatchTargetRecord(current)
    if (record) {
      return record
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    visited.add(current)
    current = parent
  }
  return undefined
}

export function warnIfCliPatchTargetMismatch(
  baseDir: string | undefined,
  patcher: TailwindcssPatcherLike | undefined,
) {
  if (!baseDir || !patcher?.packageInfo?.rootPath) {
    return
  }
  const recorded = findPatchTargetRecord(baseDir)
  if (!recorded) {
    return
  }
  const normalizedRecorded = path.normalize(recorded.record.tailwindPackagePath)
  const normalizedRuntime = path.normalize(patcher.packageInfo.rootPath)
  if (normalizedRecorded === normalizedRuntime) {
    return
  }
  const runtimeBaseDisplay = formatRelativeToBase(path.normalize(baseDir), process.cwd())
  const recordBaseDir = recorded.record.tailwindcssBasedir ?? recorded.baseDir
  const recordBaseDisplay = formatRelativeToBase(recordBaseDir, baseDir)
  const recordedDisplay = formatRelativeToBase(normalizedRecorded, recordBaseDir)
  const runtimeDisplay = formatRelativeToBase(normalizedRuntime, baseDir)
  const recordFileDisplay = formatRelativeToBase(recorded.path, recorded.baseDir)
  logger.warn(
    `检测到 ${runtimeBaseDisplay} 的 Tailwind CSS 目标不一致：CLI 在 ${recordBaseDisplay} 打补丁的是 ${recordedDisplay}，运行时读取的是 ${runtimeDisplay}。请在对应子包执行 "weapp-tw patch --cwd ${baseDir}" 或使用 pnpm --filter 针对该包执行，记录文件：${recordFileDisplay}。`,
  )
}

export function __resetPatchTargetRecordWarningsForTests() {
  loggedInvalidPatchRecords.clear()
}
