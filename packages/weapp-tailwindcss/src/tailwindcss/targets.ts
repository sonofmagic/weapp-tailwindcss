import type { TailwindcssPatcherLike } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'

const PATCH_INFO_DIRNAME = '.tw-patch'
const PATCH_INFO_FILENAME = 'tailwindcss-target.json'

interface PatchTargetRecord {
  tailwindPackagePath: string
  packageVersion?: string
  recordedAt: string
  source: 'cli' | 'runtime' | string
  tailwindcssBasedir?: string
}

interface PatchTargetRecordResult {
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
  return path.join(baseDir, PATCH_INFO_DIRNAME, PATCH_INFO_FILENAME)
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

function readPatchTargetRecord(baseDir?: string): PatchTargetRecordResult | undefined {
  if (!baseDir) {
    return undefined
  }
  const recordPath = getRecordFilePath(baseDir)
  if (!existsSync(recordPath)) {
    return undefined
  }
  try {
    const content = readFileSync(recordPath, 'utf8')
    const parsed = JSON.parse(content) as PatchTargetRecord
    if (!parsed || typeof parsed.tailwindPackagePath !== 'string') {
      return undefined
    }
    return {
      path: recordPath,
      record: parsed,
    }
  }
  catch (error) {
    logger.debug('failed to read patch target record from %s: %O', recordPath, error)
    return undefined
  }
}

export async function saveCliPatchTargetRecord(
  baseDir: string | undefined,
  patcher: TailwindcssPatcherLike | undefined,
) {
  if (!baseDir || !patcher?.packageInfo?.rootPath) {
    return undefined
  }
  const record: PatchTargetRecord = {
    tailwindPackagePath: path.normalize(patcher.packageInfo.rootPath),
    packageVersion: patcher.packageInfo.version,
    recordedAt: new Date().toISOString(),
    source: 'cli',
    tailwindcssBasedir: path.normalize(baseDir),
  }
  const recordPath = getRecordFilePath(baseDir)
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

export function warnIfCliPatchTargetMismatch(
  baseDir: string | undefined,
  patcher: TailwindcssPatcherLike | undefined,
) {
  if (!baseDir || !patcher?.packageInfo?.rootPath) {
    return
  }
  const recorded = readPatchTargetRecord(baseDir)
  if (!recorded) {
    return
  }
  const normalizedRecorded = path.normalize(recorded.record.tailwindPackagePath)
  const normalizedRuntime = path.normalize(patcher.packageInfo.rootPath)
  if (normalizedRecorded === normalizedRuntime) {
    return
  }
  const recordedDisplay = formatRelativeToBase(normalizedRecorded, baseDir)
  const runtimeDisplay = formatRelativeToBase(normalizedRuntime, baseDir)
  const baseDisplay = formatRelativeToBase(path.normalize(baseDir), process.cwd())
  const recordFileDisplay = formatRelativeToBase(recorded.path, baseDir)
  logger.warn(
    `检测到 ${baseDisplay} 的 Tailwind CSS 目标不一致：CLI 打补丁的是 ${recordedDisplay}，运行时读取的是 ${runtimeDisplay}。请在对应子包执行 "weapp-tw patch --cwd ${baseDir}"（记录文件：${recordFileDisplay}）。`,
  )
}
