import type {
  TailwindcssPatchCliMountOptions,
  TailwindcssPatchCommand,
  TailwindcssPatchCommandHandler,
} from 'tailwindcss-patch'
import type { CommonCommandOptions } from './cli/types'
import process from 'node:process'
import semver from 'semver'
import { createTailwindcssPatchCli } from 'tailwindcss-patch'
import { clearTailwindcssPatcherCache } from '@/context'
import { formatOutputPath } from './cli/context'
import {
  commandAction,
  readStringArrayOption,
  readStringOption,
  resolveCliCwd,
  resolvePatchDefaultCwd,
  toBoolean,
} from './cli/helpers'
import {
  DEFAULT_VSCODE_ENTRY_OUTPUT,
  generateVscodeIntellisenseEntry,
} from './cli/vscode-entry'
import { patchWorkspace } from './cli/workspace'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from './constants'
import { logger } from './logger'
import { createPatchTargetRecorder, logTailwindcssTarget } from './tailwindcss/targets'

type VscodeEntryCommandOptions = CommonCommandOptions & {
  css?: string
  force?: boolean | string
  output?: string | boolean
  source?: string | string[]
}

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

const mountOptions: TailwindcssPatchCliMountOptions = {
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
      const patcher = await ctx.createPatcher()
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
  },
}

process.title = 'node (weapp-tailwindcss)'

if (semver.lt(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION)) {
  logger.warn(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version >= v${WEAPP_TW_REQUIRED_NODE_VERSION} is required.`,
  )
}

const cli = createTailwindcssPatchCli({
  name: 'weapp-tailwindcss',
  mountOptions,
})

cli
  .command('vscode-entry', 'Generate a VS Code helper CSS for Tailwind IntelliSense')
  .option('--cwd <dir>', 'Working directory')
  .option('--css <file>', 'Path to the CSS file that imports weapp-tailwindcss (required)')
  .option('--output <file>', `Helper output path. Defaults to ${DEFAULT_VSCODE_ENTRY_OUTPUT}`)
  .option('--source <pattern>', 'Additional @source glob (can be repeated)')
  .option('--force', 'Overwrite the helper file when it already exists')
  .action(
    commandAction(async (options: VscodeEntryCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const baseDir = resolvedCwd ?? process.cwd()
      const cssEntry = readStringOption('css', (options as any).css)
      if (!cssEntry) {
        throw new Error('Option "--css" is required.')
      }

      const output = readStringOption('output', (options as any).output)
      const sources = readStringArrayOption('source', (options as any).source)
      const force = toBoolean((options as any).force, false)

      const result = await generateVscodeIntellisenseEntry({
        baseDir,
        cssEntry,
        output,
        sources,
        force,
      })

      logger.success(
        `VS Code helper generated -> ${formatOutputPath(result.outputPath, resolvedCwd)}`,
      )
    }),
  )

cli.help()
cli.version(process.env.npm_package_version ?? '0.0.0')
cli.parse()
