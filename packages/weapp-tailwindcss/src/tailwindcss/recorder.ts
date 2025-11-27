import type { PatchTargetRecorder, PatchTargetRecorderOptions } from './targets'
import type { TailwindcssPatcherLike } from '@/types'
import { logger } from '@/logger'
import { createTailwindPatchPromise } from './runtime'
import {
  createPatchTargetRecorder,

} from './targets'

interface SetupPatchRecorderOptions extends PatchTargetRecorderOptions {
  logMessage?: boolean
  messagePrefix?: string
}

export interface PatchRecorderState {
  recorder?: PatchTargetRecorder
  patchPromise: Promise<unknown>
  onPatchCompleted?: () => Promise<void> | void
}

export function setupPatchRecorder(
  patcher: TailwindcssPatcherLike | undefined,
  baseDir: string | undefined,
  options?: SetupPatchRecorderOptions,
): PatchRecorderState {
  const recorder = createPatchTargetRecorder(baseDir, patcher, options)
  if (recorder?.message && options?.logMessage !== false) {
    const prefix = options?.messagePrefix ? `${options.messagePrefix} ` : ''
    logger.info('%s%s', prefix, recorder.message)
  }

  const onPatchCompleted = recorder?.onPatched
    ? async () => {
      await recorder.onPatched()
    }
    : undefined
  const patchPromise = patcher
    ? createTailwindPatchPromise(patcher, onPatchCompleted)
    : Promise.resolve()

  return {
    recorder,
    patchPromise,
    onPatchCompleted,
  }
}
