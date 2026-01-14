import type { WorkspacePatchOptions, WorkspacePatchResult } from './types'
import { normalizeOptions, TailwindcssPatcher } from 'tailwindcss-patch'
import { clearTailwindcssPatcherCache } from '@/context'
import { logger } from '@/logger'
import { getTailwindcssPackageInfo } from '@/tailwindcss'
import { createPatchTargetRecorder, logTailwindcssTarget } from '@/tailwindcss/targets'
import { withDefaultExtendLengthUnits } from '../patch-options'
import { formatDisplayName } from './patch-utils'

function createWorkspacePatcher(cwd: string) {
  const normalized = normalizeOptions(
    withDefaultExtendLengthUnits({
      cwd,
    }),
  )
  return new TailwindcssPatcher(normalized)
}

export async function patchWorkspacePackage(
  workspaceRoot: string,
  dir: string,
  pkgName: string | undefined,
  options: WorkspacePatchOptions,
): Promise<WorkspacePatchResult> {
  const displayName = formatDisplayName(workspaceRoot, dir, pkgName)
  const tailwindInfo = getTailwindcssPackageInfo({ paths: [dir] })
  if (!tailwindInfo?.rootPath) {
    logger.info('[workspace] 跳过 %s（tailwindcss 未安装）。', displayName)
    return {
      dir,
      name: pkgName,
      status: 'skipped',
      message: 'tailwindcss 未安装，已跳过。',
    }
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
    logger.success('[workspace] 已补丁 %s', displayName)
    return {
      dir,
      name: pkgName,
      status: 'patched',
      message: '已完成 patch。',
    }
  }
  catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    const suggestion = `请在 ${dir} 运行 "weapp-tw patch --cwd ${dir}".`
    const message = `${reason}，${suggestion}`
    logger.error('[workspace] 补丁失败 %s：%s', displayName, message)
    return {
      dir,
      name: pkgName,
      status: 'failed',
      message,
    }
  }
}

export { summarizeWorkspaceResults } from './patch-utils'
