import type { TailwindcssRuntimeLike } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { logRuntimeTailwindcssTarget } from './runtime-logs'

function formatRelativeToBase(targetPath: string, baseDir?: string) {
  const normalized = path.normalize(targetPath)
  if (!baseDir) {
    return normalized.replace(/\\/g, '/')
  }
  const relative = path.relative(baseDir, normalized)
  if (!relative || relative === '.') {
    return '.'
  }
  if (relative.startsWith('..')) {
    return normalized.replace(/\\/g, '/')
  }
  return path.join('.', relative).replace(/\\/g, '/')
}

export function logTailwindcssTarget(
  tailwindRuntime: TailwindcssRuntimeLike | undefined,
  baseDir?: string,
) {
  const packageInfo = tailwindRuntime?.packageInfo
  const label = 'Weapp-tailwindcss'
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
  logRuntimeTailwindcssTarget(baseDir, packageInfo.rootPath, packageInfo.version)
  logger.debug('%s 解析 Tailwind CSS -> %s%s', label, displayPath, version)
}
