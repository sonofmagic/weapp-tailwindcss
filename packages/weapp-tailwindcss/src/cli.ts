import type { CommonCommandOptions } from './cli/types'
import process from 'node:process'
import semver from 'semver'
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
import { logObsoletePatchCommand, logPatchCommandObsoleteNotice, obsoletePatchCommands, PATCH_COMMAND_OBSOLETE_NOTICE } from './cli/mount-options'
import {
  generateVscodeIntellisenseEntry,
} from './cli/vscode-entry'
import { WEAPP_TW_REQUIRED_NODE_VERSION_RANGE } from './constants'
import { logger } from './logger'

type CliOptions = CommonCommandOptions & Record<string, boolean | string | string[] | undefined>

process.title = 'node (weapp-tailwindcss)'

if (!semver.satisfies(process.versions.node, WEAPP_TW_REQUIRED_NODE_VERSION_RANGE)) {
  logger.warn(
    `You are using Node.js ${process.versions.node}. For weapp-tailwindcss, Node.js version ${WEAPP_TW_REQUIRED_NODE_VERSION_RANGE} is required.`,
  )
}

function parseArgs(argv: string[]) {
  const options: CliOptions = {}
  const positional: string[] = []
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === undefined) {
      continue
    }
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }

    const [rawKey, inlineValue] = arg.slice(2).split('=', 2)
    if (!rawKey) {
      continue
    }
    const key = rawKey.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
    const next = argv[index + 1]
    let value: boolean | string = true
    if (inlineValue !== undefined) {
      value = inlineValue
    }
    else if (next !== undefined && !next.startsWith('-')) {
      index++
      value = next
    }
    const current = options[key]
    if (current === undefined) {
      options[key] = value
    }
    else if (Array.isArray(current)) {
      current.push(String(value))
    }
    else {
      options[key] = [String(current), String(value)]
    }
  }
  return {
    command: positional[0],
    options,
  }
}

function printHelp() {
  logger.log(`weapp-tailwindcss

Usage:
  weapp-tw <command> [options]

Commands:
  patch          Deprecated no-op: v5 runtime handles Tailwind CSS automatically
  status         Deprecated no-op: patch status is no longer required
  vscode-entry   Generate a VS Code helper CSS for Tailwind IntelliSense
  doctor         Check project setup for weapp-tailwindcss
`)
}

async function runPatch() {
  logPatchCommandObsoleteNotice()
  logger.success('已跳过：当前版本不需要手动执行 Tailwind CSS patch。')
}

async function runStatus(options: CliOptions) {
  const payload = {
    required: false,
    status: 'unnecessary',
    message: PATCH_COMMAND_OBSOLETE_NOTICE,
  }
  if (toBoolean(options['json'], false)) {
    logger.log(JSON.stringify(payload, null, 2))
    return
  }

  logPatchCommandObsoleteNotice()
  logger.success('无需检查 Tailwind CSS patch 状态。')
}

async function runVscodeEntry(options: CliOptions) {
  const resolvedCwd = resolveCliCwd(options.cwd)
  const baseDir = resolvedCwd ?? process.cwd()
  const cssEntry = readStringOption('css', options['css'])
  if (!cssEntry) {
    throw new Error('Option "--css" is required.')
  }

  const output = readStringOption('output', options['output'])
  const sources = readStringArrayOption('source', options['source'])
  const force = toBoolean(options['force'], false)

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
}

async function runDoctor(options: CliOptions) {
  const resolvedCwd = resolveCliCwd(options.cwd)
  const report = createDoctorReport({ cwd: resolvedCwd })
  if (toBoolean(options['json'], false)) {
    logger.log(JSON.stringify(report, null, 2))
  }
  else {
    logger.log(formatDoctorReport(report))
  }

  if (hasDoctorFailure(report, toBoolean(options['strict'], false))) {
    process.exitCode = 1
  }
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2))

  await commandAction(async () => {
    switch (command) {
      case undefined:
      case '-h':
      case '--help':
      case 'help':
        printHelp()
        return
      case '-v':
      case '--version':
      case 'version':
        logger.log(process.env['npm_package_version'] ?? '0.0.0')
        return
      case 'patch':
      case 'install':
        await runPatch()
        return
      case 'status':
        await runStatus(options)
        return
      case 'vscode-entry':
        await runVscodeEntry(options)
        return
      case 'doctor':
        await runDoctor(options)
        return
      default:
        if ((obsoletePatchCommands as readonly string[]).includes(command)) {
          logObsoletePatchCommand(command)
          return
        }
        throw new Error(`Unknown command: ${command}`)
    }
  })()
}

void main()
