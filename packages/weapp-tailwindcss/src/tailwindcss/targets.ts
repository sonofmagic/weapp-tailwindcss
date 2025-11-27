import type { TailwindcssPatcherLike } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { md5Hash } from '@/cache/md5'
import { WEAPP_TW_VERSION } from '@/constants'
import { findNearestPackageRoot } from '@/context/workspace'

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
  cwd?: string
  patchVersion?: string
  packageJsonPath?: string
  recordKey?: string
}

interface PatchTargetRecordResult {
  baseDir: string
  path: string
  record: PatchTargetRecord
}

export interface SavePatchTargetRecordOptions {
  cwd?: string
  source?: 'cli' | 'runtime' | string
  recordPath?: string
  recordKey?: string
  packageJsonPath?: string
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

function resolveRecordLocation(baseDir: string) {
  const normalizedBase = path.normalize(baseDir)
  const packageRoot = findNearestPackageRoot(normalizedBase) ?? normalizedBase
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const hasPackageJson = existsSync(packageJsonPath)
  const recordKeySource = hasPackageJson ? packageJsonPath : normalizedBase
  const recordKey = md5Hash(path.normalize(recordKeySource))
  const recordDir = path.join(packageRoot, 'node_modules', '.cache', 'weapp-tailwindcss', recordKey)
  const recordPath = path.join(recordDir, PATCH_INFO_FILENAME)
  return {
    normalizedBase,
    packageRoot,
    recordDir,
    recordKey,
    recordPath,
    packageJsonPath: hasPackageJson ? packageJsonPath : undefined,
  }
}

function getRecordFileCandidates(baseDir: string) {
  const { normalizedBase, packageRoot, recordPath } = resolveRecordLocation(baseDir)
  const candidates = new Set<string>([
    recordPath,
    path.join(packageRoot, PATCH_INFO_CACHE_RELATIVE_PATH),
    path.join(normalizedBase, PATCH_INFO_CACHE_RELATIVE_PATH),
    path.join(normalizedBase, PATCH_INFO_LEGACY_RELATIVE_PATH),
  ])
  return [...candidates]
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
  options?: SavePatchTargetRecordOptions,
) {
  if (!baseDir || !patcher?.packageInfo?.rootPath) {
    return undefined
  }
  const normalizedBase = path.normalize(baseDir)
  const location = resolveRecordLocation(normalizedBase)
  const recordPath = options?.recordPath ? path.normalize(options.recordPath) : location.recordPath
  const record: PatchTargetRecord = {
    tailwindPackagePath: path.normalize(patcher.packageInfo.rootPath),
    packageVersion: patcher.packageInfo.version,
    recordedAt: new Date().toISOString(),
    source: options?.source ?? 'cli',
    tailwindcssBasedir: normalizedBase,
    cwd: options?.cwd ? path.normalize(options.cwd) : normalizedBase,
    patchVersion: WEAPP_TW_VERSION,
    packageJsonPath: options?.packageJsonPath ?? location.packageJsonPath,
    recordKey: options?.recordKey ?? location.recordKey,
  }
  try {
    await mkdir(path.dirname(recordPath), { recursive: true })
    await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    return recordPath
  }
  catch (error) {
    const baseDisplay = formatRelativeToBase(normalizedBase, process.cwd())
    logger.warn(
      '自动更新 Tailwind CSS 补丁记录失败，请在 %s 运行 "weapp-tw patch --cwd %s"。',
      baseDisplay,
      normalizedBase,
    )
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

export interface PatchTargetRecorder {
  recordPath: string
  message?: string
  reason?: string
  onPatched: () => Promise<string | undefined>
}

export interface PatchTargetRecorderOptions {
  source?: 'cli' | 'runtime' | string
  cwd?: string
  recordTarget?: boolean
  alwaysRecord?: boolean
}

export function createPatchTargetRecorder(
  baseDir: string | undefined,
  patcher: TailwindcssPatcherLike | undefined,
  options?: PatchTargetRecorderOptions,
): PatchTargetRecorder | undefined {
  if (!baseDir || !patcher?.packageInfo?.rootPath || options?.recordTarget === false) {
    return undefined
  }

  const normalizedBase = path.normalize(baseDir)
  const recorded = findPatchTargetRecord(normalizedBase)
  const location = resolveRecordLocation(normalizedBase)
  const expectedPath = path.normalize(patcher.packageInfo.rootPath)

  let reason: string | undefined
  if (!recorded) {
    reason = 'missing'
  }
  else {
    const normalizedRecorded = path.normalize(recorded.record.tailwindPackagePath)
    if (normalizedRecorded !== expectedPath) {
      reason = 'mismatch'
    }
    else if (
      path.normalize(recorded.path) !== path.normalize(location.recordPath)
      || !recorded.record.recordKey
      || recorded.record.recordKey !== location.recordKey
    ) {
      reason = 'migrate'
    }
    else if (!recorded.record.patchVersion || recorded.record.patchVersion !== WEAPP_TW_VERSION) {
      reason = 'stale'
    }
    else if (
      options?.cwd
      && recorded.record.cwd
      && path.normalize(recorded.record.cwd) !== path.normalize(options.cwd)
    ) {
      reason = 'metadata'
    }
    else if (!recorded.record.cwd && options?.cwd) {
      reason = 'metadata'
    }
  }

  const shouldPersist = options?.alwaysRecord || !recorded || Boolean(reason)
  if (!shouldPersist) {
    return undefined
  }

  let message: string | undefined
  switch (reason) {
    case 'mismatch':
      message = '检测到 Tailwind CSS 目标记录与当前解析结果不一致，正在自动重新 patch 并刷新缓存。'
      break
    case 'migrate':
    case 'stale':
      message = '正在刷新当前子包的 Tailwind CSS 补丁记录，确保缓存隔离。'
      break
    case 'missing':
      message = '未找到当前子包的 Tailwind CSS 目标记录，正在生成。'
      break
    default:
      break
  }

  const onPatched = async () => saveCliPatchTargetRecord(normalizedBase, patcher, {
    cwd: options?.cwd ?? normalizedBase,
    source: options?.source ?? 'cli',
    recordPath: location.recordPath,
    recordKey: location.recordKey,
    packageJsonPath: location.packageJsonPath,
  })

  return {
    recordPath: location.recordPath,
    message,
    reason,
    onPatched,
  }
}

export function __resetPatchTargetRecordWarningsForTests() {
  loggedInvalidPatchRecords.clear()
}
