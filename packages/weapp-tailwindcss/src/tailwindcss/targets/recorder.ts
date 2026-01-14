import type { PatchTargetRecorder, PatchTargetRecorderOptions } from './types'
import type { TailwindcssPatcherLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { WEAPP_TW_VERSION } from '@/constants'
import { resolveRecordLocation } from './paths'
import { readPatchTargetRecord, saveCliPatchTargetRecord } from './record-io'

function findPatchTargetRecord(baseDir?: string) {
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
