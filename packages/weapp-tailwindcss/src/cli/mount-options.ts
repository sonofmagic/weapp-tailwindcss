import type {
  PatchStatusReport,
  TailwindcssPatchCliMountOptions,
  TailwindcssPatchCommand,
  TailwindcssPatchCommandHandler,
} from 'tailwindcss-patch'
import process from 'node:process'
import { clearTailwindcssPatcherCache } from '@/context'
import { logger } from '@/logger'
import { createPatchTargetRecorder, logTailwindcssTarget } from '@/tailwindcss/targets'
import { formatOutputPath } from './context'
import {
  resolvePatchDefaultCwd,
  toBoolean,
} from './helpers'
import { buildExtendLengthUnitsOverride } from './patch-options'
import { patchWorkspace } from './workspace'

function handleCliError(error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message)
    if (error.stack && process.env.WEAPP_TW_DEBUG === '1') {
      logger.error(error.stack)
    }
  }
  else {
    logger.error(String(error))
  }
}

function withCommandErrorHandling<TCommand extends TailwindcssPatchCommand>(
  handler: TailwindcssPatchCommandHandler<TCommand>,
): TailwindcssPatchCommandHandler<TCommand> {
  return (async (ctx, next) => {
    try {
      return await handler(ctx, next)
    }
    catch (error) {
      handleCliError(error)
      process.exitCode = 1
      return undefined as ReturnType<TailwindcssPatchCommandHandler<TCommand>>
    }
  }) as TailwindcssPatchCommandHandler<TCommand>
}

async function createPatcherWithDefaultExtendLengthUnits<TCommand extends TailwindcssPatchCommand>(
  ctx: Parameters<TailwindcssPatchCommandHandler<TCommand>>[0],
) {
  const patchOptions = await ctx.loadPatchOptions()
  const extendLengthUnitsOverride = buildExtendLengthUnitsOverride(patchOptions)
  if (extendLengthUnitsOverride) {
    return ctx.createPatcher(extendLengthUnitsOverride)
  }
  return ctx.createPatcher()
}

function formatStatusFilesHint(files?: string[]) {
  if (!files?.length) {
    return ''
  }
  return ` (${files.join(', ')})`
}

function logPatchStatusReport(report: PatchStatusReport) {
  const applied = report.entries.filter(entry => entry.status === 'applied')
  const pending = report.entries.filter(entry => entry.status === 'not-applied')
  const skipped = report.entries.filter(
    entry => entry.status === 'skipped' || entry.status === 'unsupported',
  )
  const packageLabel = `${report.package.name ?? 'tailwindcss'}@${report.package.version ?? 'unknown'}`
  logger.info(`Patch status for ${packageLabel} (v${report.majorVersion})`)

  if (applied.length) {
    logger.success('Applied:')
    applied.forEach((entry) => {
      logger.success(`  - ${entry.name}${formatStatusFilesHint(entry.files)}`)
    })
  }

  if (pending.length) {
    logger.warn('Needs attention:')
    pending.forEach((entry) => {
      const details = entry.reason ? ` - ${entry.reason}` : ''
      logger.warn(`  - ${entry.name}${formatStatusFilesHint(entry.files)}${details}`)
    })
  }
  else {
    logger.success('All applicable patches are applied.')
  }

  if (skipped.length) {
    logger.info('Skipped:')
    skipped.forEach((entry) => {
      const details = entry.reason ? ` - ${entry.reason}` : ''
      logger.info(`  - ${entry.name}${details}`)
    })
  }
}

export const mountOptions: TailwindcssPatchCliMountOptions = {
  commandOptions: {
    install: {
      name: 'patch',
      aliases: ['install'],
      appendDefaultOptions: false,
      optionDefs: [
        {
          flags: '--cwd <dir>',
          description: 'Working directory',
          config: { default: resolvePatchDefaultCwd() },
        },
        {
          flags: '--record-target',
          description:
            'Write tailwindcss target metadata (node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json). Pass "--record-target false" to skip.',
          config: { default: true },
        },
        {
          flags: '--clear-cache',
          description: 'Clear tailwindcss-patch cache before patch (opt-in)',
        },
        {
          flags: '--workspace',
          description: 'Scan pnpm workspace packages and patch each Tailwind CSS dependency',
        },
      ],
    },
    status: {
      appendDefaultOptions: false,
      optionDefs: [
        {
          flags: '--cwd <dir>',
          description: 'Working directory',
          config: { default: resolvePatchDefaultCwd() },
        },
        {
          flags: '--json',
          description: 'Print a JSON report of patch status',
        },
      ],
    },
  },
  commandHandlers: {
    install: withCommandErrorHandling<'install'>(async (ctx) => {
      const shouldClearCache = toBoolean((ctx as any).args.clearCache, false)
      const shouldRecordTarget = toBoolean((ctx as any).args.recordTarget, true)
      const runWorkspace = toBoolean((ctx as any).args.workspace, false)
      if (runWorkspace) {
        await patchWorkspace({
          cwd: ctx.cwd,
          clearCache: shouldClearCache,
          recordTarget: shouldRecordTarget,
        })
        return
      }
      const patcher = await createPatcherWithDefaultExtendLengthUnits(ctx)
      if (shouldClearCache) {
        await clearTailwindcssPatcherCache(patcher, { removeDirectory: true })
      }
      const recorder = createPatchTargetRecorder(ctx.cwd, patcher, {
        source: 'cli',
        cwd: ctx.cwd,
        recordTarget: shouldRecordTarget,
        alwaysRecord: true,
      })
      if (recorder?.message) {
        logger.info(recorder.message)
      }
      logTailwindcssTarget('cli', patcher, ctx.cwd)
      await patcher.patch()
      if (recorder?.onPatched) {
        const recordPath = await recorder.onPatched()
        if (recordPath) {
          logger.info(`记录 weapp-tw patch 目标 -> ${formatOutputPath(recordPath, ctx.cwd)}`)
        }
      }
      logger.success('Tailwind CSS 运行时补丁已完成。')
    }),
    extract: withCommandErrorHandling<'extract'>(async (_ctx, next) => next()),
    tokens: withCommandErrorHandling<'tokens'>(async (_ctx, next) => next()),
    init: withCommandErrorHandling<'init'>(async (_ctx, next) => next()),
    status: withCommandErrorHandling<'status'>(async (ctx) => {
      const patcher = await createPatcherWithDefaultExtendLengthUnits(ctx)
      const report = await patcher.getPatchStatus()

      if (ctx.args.json) {
        logger.log(JSON.stringify(report, null, 2))
        return report
      }

      logPatchStatusReport(report)
      return report
    }),
  },
}
