import process from 'node:process'
import { logger, pc } from '@weapp-tailwindcss/logger'

interface RuntimeLogDedupeHolder {
  __WEAPP_TW_RUNTIME_LOG_DEDUPE__?: Set<string>
}

const runtimeLogDedupeHolder = globalThis as RuntimeLogDedupeHolder
const runtimeLogDedupe = runtimeLogDedupeHolder.__WEAPP_TW_RUNTIME_LOG_DEDUPE__
  ?? (runtimeLogDedupeHolder.__WEAPP_TW_RUNTIME_LOG_DEDUPE__ = new Set<string>())

function createRuntimeLogKey(
  category: 'target' | 'version' | 'missing',
  baseDir?: string,
  rootPath?: string,
  version?: string,
) {
  return JSON.stringify([
    category,
    baseDir ?? process.cwd(),
    rootPath ?? '',
    version ?? '',
  ])
}

function markRuntimeLog(
  category: 'target' | 'version' | 'missing',
  baseDir?: string,
  rootPath?: string,
  version?: string,
) {
  const key = createRuntimeLogKey(category, baseDir, rootPath, version)
  if (runtimeLogDedupe.has(key)) {
    return false
  }
  runtimeLogDedupe.add(key)
  return true
}

export function logRuntimeTailwindcssTarget(baseDir?: string, rootPath?: string, version?: string) {
  if (!markRuntimeLog('target', baseDir, rootPath, version)) {
    return
  }
  const versionText = version ? ` (v${version})` : ''
  logger.info('%s 使用 Tailwind CSS%s', 'Weapp-tailwindcss', versionText)
}

export function logRuntimeTailwindcssVersion(baseDir?: string, rootPath?: string, version?: string) {
  if (version) {
    if (!markRuntimeLog('version', baseDir, rootPath, version)) {
      return
    }
    logger.success(`当前使用 ${pc.cyanBright('Tailwind CSS')} 版本为: ${pc.underline(pc.bold(pc.green(version)))}`)
    return
  }

  if (!markRuntimeLog('missing', baseDir, rootPath, version)) {
    return
  }
  logger.warn(`${pc.cyanBright('Tailwind CSS')} 未安装，已跳过版本检测与补丁应用。`)
}

export function __resetRuntimeTailwindcssLogsForTests() {
  runtimeLogDedupe.clear()
}
