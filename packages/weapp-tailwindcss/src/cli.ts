import type { CommonCommandOptions } from './cli/types'
import process from 'node:process'
import semver from 'semver'
import { createTailwindcssPatchCli } from 'tailwindcss-patch'
import { formatOutputPath } from './cli/context'
import {
  commandAction,
  readStringArrayOption,
  readStringOption,
  resolveCliCwd,
  toBoolean,
} from './cli/helpers'
import { mountOptions } from './cli/mount-options'
import {
  DEFAULT_VSCODE_ENTRY_OUTPUT,
  generateVscodeIntellisenseEntry,
} from './cli/vscode-entry'
import { WEAPP_TW_REQUIRED_NODE_VERSION } from './constants'
import { logger } from './logger'

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
