import type { CommonCommandOptions } from './cli/types'
import process from 'node:process'
import semver from 'semver'
import { createTailwindcssPatchCli } from 'tailwindcss-patch'
import { formatOutputPath } from './cli/context'
import {
  createDoctorReport,
  formatDoctorReport,
  hasDoctorFailure,
} from './cli/doctor'
import {
  commandAction,
  readStringArrayOption,
  readStringOption,
  resolveCliCwd,
  toBoolean,
} from './cli/helpers'
import { logPatchCommandObsoleteNotice, mountOptions, PATCH_COMMAND_OBSOLETE_NOTICE } from './cli/mount-options'
import {
  DEFAULT_VSCODE_ENTRY_OUTPUT,
  generateVscodeIntellisenseEntry,
} from './cli/vscode-entry'
import { WEAPP_TW_REQUIRED_NODE_VERSION_RANGE } from './constants'
import { logger } from './logger'

type VscodeEntryCommandOptions = CommonCommandOptions & {
  css?: string
  force?: boolean | string
  output?: string | boolean
  source?: string | string[]
}

type DoctorCommandOptions = CommonCommandOptions & {
  json?: boolean | string
  strict?: boolean | string
}

type PatchCommandOptions = CommonCommandOptions & {
  clearCache?: boolean | string
  json?: boolean | string
  recordTarget?: boolean | string
  workspace?: boolean | string
}

process.title = 'node (weapp-tailwindcss)'

if (!semver.satisfies(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION_RANGE)) {
  logger.warn(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version ${WEAPP_TW_REQUIRED_NODE_VERSION_RANGE} is required.`,
  )
}

const cli = createTailwindcssPatchCli({
  name: 'weapp-tailwindcss',
  mountOptions,
})

cli
  .command('patch', 'Deprecated no-op: v5 runtime handles Tailwind CSS automatically')
  .alias('install')
  .option('--cwd <dir>', 'Ignored working directory')
  .option('--clear-cache', 'Ignored compatibility option')
  .option('--record-target [enabled]', 'Ignored compatibility option')
  .option('--workspace', 'Ignored compatibility option')
  .action(
    commandAction(async (_options: PatchCommandOptions) => {
      logPatchCommandObsoleteNotice()
      logger.success('已跳过：当前版本不需要手动执行 Tailwind CSS patch。')
    }),
  )

cli
  .command('status', 'Deprecated no-op: patch status is no longer required')
  .option('--cwd <dir>', 'Ignored working directory')
  .option('--json', 'Print a JSON no-op report')
  .action(
    commandAction(async (options: PatchCommandOptions) => {
      const payload = {
        required: false,
        status: 'unnecessary',
        message: PATCH_COMMAND_OBSOLETE_NOTICE,
      }
      if (toBoolean((options as any).json, false)) {
        logger.log(JSON.stringify(payload, null, 2))
        return
      }

      logPatchCommandObsoleteNotice()
      logger.success('无需检查 Tailwind CSS patch 状态。')
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

cli
  .command('doctor', 'Check project setup for weapp-tailwindcss')
  .option('--cwd <dir>', 'Working directory')
  .option('--json', 'Print a JSON report')
  .option('--strict', 'Exit with code 1 when warnings are found')
  .action(
    commandAction(async (options: DoctorCommandOptions) => {
      const resolvedCwd = resolveCliCwd(options.cwd)
      const report = createDoctorReport({ cwd: resolvedCwd })
      if (toBoolean((options as any).json, false)) {
        logger.log(JSON.stringify(report, null, 2))
      }
      else {
        logger.log(formatDoctorReport(report))
      }

      if (hasDoctorFailure(report, toBoolean((options as any).strict, false))) {
        process.exitCode = 1
      }
    }),
  )

cli.help()
cli.version(process.env['npm_package_version'] ?? '0.0.0')
cli.parse()
