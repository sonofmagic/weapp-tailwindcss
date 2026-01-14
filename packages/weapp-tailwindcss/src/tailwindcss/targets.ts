import type { TailwindcssPatcherLike } from '@/types'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { formatRelativeToBase } from './targets/paths'
import { __resetPatchTargetRecordWarningsForTests, saveCliPatchTargetRecord } from './targets/record-io'
import { createPatchTargetRecorder } from './targets/recorder'

export type { PatchTargetRecorder, PatchTargetRecorderOptions, SavePatchTargetRecordOptions } from './targets/types'

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
export { __resetPatchTargetRecordWarningsForTests, createPatchTargetRecorder, saveCliPatchTargetRecord }
