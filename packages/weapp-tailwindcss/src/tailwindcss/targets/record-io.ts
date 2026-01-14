import type { PatchTargetRecord, PatchTargetRecordResult, SavePatchTargetRecordOptions } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { WEAPP_TW_VERSION } from '@/constants'
import { formatRelativeToBase, getRecordFileCandidates, resolveRecordLocation } from './paths'

const loggedInvalidPatchRecords = new Set<string>()

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

export function readPatchTargetRecord(baseDir?: string): PatchTargetRecordResult | undefined {
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

export function __resetPatchTargetRecordWarningsForTests() {
  loggedInvalidPatchRecords.clear()
}
