import type { CommonCommandOptions, ExtractCommandOptions, TokensCommandOptions } from './cli/types'
import type { UserDefinedOptions } from '@/types'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import cac from 'cac'
import semver from 'semver'
import { groupTokensByFile } from 'tailwindcss-patch'
import { clearTailwindcssPatcherCache } from '@/context'
import { loadTailwindcssMangleConfig } from './cli/config'
import {
  buildTailwindcssPatcherOptions,
  createCliContext,
  formatOutputPath,
  resolveEntry,
} from './cli/context'
import {
  commandAction,
  ensureDir,
  normalizeExtractFormat,
  normalizeTokenFormat,
  readStringArrayOption,
  readStringOption,
  resolveCliCwd,
  toBoolean,
} from './cli/helpers'
import { collectTailwindTokens, formatTokenLine, logTokenPreview } from './cli/tokens'
import {
  DEFAULT_VSCODE_ENTRY_OUTPUT,
  generateVscodeIntellisenseEntry,
} from './cli/vscode-entry'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from './constants'
import { logger } from './logger'
import { logTailwindcssTarget, saveCliPatchTargetRecord } from './tailwindcss/targets'

type VscodeEntryCommandOptions = CommonCommandOptions & {
  css?: string
  force?: boolean | string
  output?: string | boolean
  source?: string | string[]
}

process.title = 'node (weapp-tailwindcss)'

if (semver.lt(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION)) {
  logger.warn(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version >= v${WEAPP_TW_REQUIRED_NODE_VERSION} is required.`,
  )
}

const cli = cac('weapp-tailwindcss')

cli
  .command('patch', 'Apply Tailwind CSS runtime patches')
  .alias('install')
  .option('--cwd <dir>', 'Working directory')
  .option('--record-target', 'Write tailwindcss target metadata (.tw-patch/tailwindcss-target.json)')
  .option('--clear-cache', 'Clear tailwindcss-patch cache before patch (opt-in)')
  .action(
    commandAction(async (options: CommonCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const ctx = createCliContext(undefined, resolvedCwd)
      const shouldClearCache = toBoolean((options as any).clearCache, false)
      if (shouldClearCache) {
        await clearTailwindcssPatcherCache(ctx.twPatcher, { removeDirectory: true })
      }
      logTailwindcssTarget('cli', ctx.twPatcher, ctx.tailwindcssBasedir)
      await ctx.twPatcher.patch()
      const shouldRecordTarget = toBoolean(options.recordTarget, false)
      if (shouldRecordTarget) {
        const recordPath = await saveCliPatchTargetRecord(ctx.tailwindcssBasedir, ctx.twPatcher)
        if (recordPath) {
          logger.info(`记录 weapp-tw patch 目标 -> ${formatOutputPath(recordPath, resolvedCwd)}`)
        }
      }
      logger.success('Tailwind CSS 运行时补丁已完成。')
    }),
  )

cli
  .command('extract', 'Collect generated class names into a cache file')
  .option('--cwd <dir>', 'Working directory')
  .option('--output <file>', 'Override output file path')
  .option('--format <format>', 'Output format (json|lines)')
  .option('--css <file>', 'Tailwind CSS entry CSS when using v4')
  .option('--no-write', 'Skip writing to disk')
  .action(
    commandAction(async (options: ExtractCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const outputPath = readStringOption('output', options.output)
      const formatOption = readStringOption('format', options.format)
      const cssOption = readStringOption('css', options.css)

      const overrides: Partial<UserDefinedOptions> = {}
      if (cssOption) {
        overrides.cssEntries = [resolveEntry(cssOption, resolvedCwd)]
      }

      const normalizedFormat = normalizeExtractFormat(formatOption)
      const outputOverrides = buildTailwindcssPatcherOptions(
        normalizedFormat || outputPath
          ? {
              output: {
                file: outputPath,
                format: normalizedFormat,
              },
            }
          : undefined,
      )

      if (outputOverrides) {
        overrides.tailwindcssPatcherOptions = outputOverrides
      }

      const ctx = createCliContext(overrides, resolvedCwd)
      const write = toBoolean(options.write, true)
      const result = await ctx.twPatcher.extract({ write })
      const classCount = result?.classList?.length ?? result?.classSet?.size ?? 0

      if (result?.filename) {
        logger.success(`Collected ${classCount} classes -> ${formatOutputPath(result.filename, resolvedCwd)}`)
      }
      else {
        logger.success(`Collected ${classCount} classes.`)
      }
    }),
  )

cli
  .command('tokens', 'Extract Tailwind tokens with location metadata')
  .option('--cwd <dir>', 'Working directory')
  .option('--output <file>', 'Override output file path')
  .option('--format <format>', 'Output format (json|lines|grouped-json)')
  .option('--group-key <key>', 'Grouping key for grouped-json output (relative|absolute)')
  .option('--no-write', 'Skip writing to disk')
  .action(
    commandAction(async (options: TokensCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const outputPath = readStringOption('output', options.output)
      const formatInput = readStringOption('format', options.format)
      const groupKeyInput = readStringOption('group-key', options.groupKey)

      const format = normalizeTokenFormat(formatInput ?? 'json')
      const groupKey = groupKeyInput === 'absolute' ? 'absolute' : 'relative'
      const write = toBoolean(options.write, true)
      const ctx = createCliContext(undefined, resolvedCwd)
      const report = await collectTailwindTokens(ctx.twPatcher)
      const baseDir = resolvedCwd ?? process.cwd()

      if (write) {
        const targetRelative = outputPath ?? '.tw-patch/tw-token-report.json'
        const target = path.resolve(baseDir, targetRelative)
        await ensureDir(path.dirname(target))
        if (format === 'json') {
          await writeFile(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
        }
        else if (format === 'grouped-json') {
          const grouped = groupTokensByFile(report, {
            key: groupKey,
            stripAbsolutePaths: groupKey !== 'absolute',
          })
          await writeFile(target, `${JSON.stringify(grouped, null, 2)}\n`, 'utf8')
        }
        else {
          const lines = report.entries.map(formatTokenLine)
          await writeFile(target, `${lines.join('\n')}\n`, 'utf8')
        }
        logger.success(
          `Collected ${report.entries.length} tokens (${format}) -> ${formatOutputPath(target, resolvedCwd)}`,
        )
      }
      else {
        logger.success(`Collected ${report.entries.length} tokens from ${report.filesScanned} files.`)
        logTokenPreview(report, format, groupKey)
      }

      if (report.skippedFiles.length > 0) {
        logger.warn('Skipped files:')
        for (const skipped of report.skippedFiles) {
          logger.warn(`  - ${skipped.file} (${skipped.reason})`)
        }
      }
    }),
  )

cli
  .command('init', 'Generate a tailwindcss-patch config file')
  .option('--cwd <dir>', 'Working directory')
  .action(
    commandAction(async (options: CommonCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const moduleResult = await loadTailwindcssMangleConfig()
      if (!moduleResult) {
        logger.error('Unable to load @tailwindcss-mangle/config. Please install tailwindcss-patch >= 8.2.0.')
        process.exitCode = 1
        return
      }
      const cwd = resolvedCwd ?? process.cwd()
      await moduleResult.initConfig(cwd)
      logger.success(`${moduleResult.CONFIG_NAME}.config.ts initialized.`)
    }),
  )

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
