#!/usr/bin/env node
import type { WetwFramework } from './types'
import process from 'node:process'
import { select } from '@inquirer/prompts'
import { cac } from 'cac'
import pkg from '../package.json' assert { type: 'json' }
import { addComponents } from './add'
import { DEFAULT_FRAMEWORK, loadWetwConfig } from './config'
import { writeDefaultConfig } from './init'
import { resolveRegistry } from './registry'

const frameworkChoices: Array<{
  title: string
  value: WetwFramework
  description: string
}> = [
  { title: 'mp-weixin', value: 'mp-weixin', description: '原生小程序' },
  { title: 'uni-app vue3', value: 'uni-app-vue3', description: 'uni-app + Vue 3' },
  { title: 'taro react', value: 'taro-react', description: 'Taro + React' },
]

async function askFramework(): Promise<WetwFramework> {
  try {
    return await select<WetwFramework>({
      message: '选择要生成的框架类型',
      choices: frameworkChoices,
      default: DEFAULT_FRAMEWORK,
    })
  }
  catch (_error) {
    throw new Error('Cancelled')
  }
}

const cli = cac('wetw')

cli
  .option('--config <path>', 'Path to wetw.config.(ts|js|json)')
  .option('--cwd <path>', 'Working directory (defaults to process.cwd())')
  .option('--framework <name>', 'Target framework (mp-weixin|uni-app-vue3|taro-react)')

function handleError(error: unknown) {
  console.error((error as Error).message)
  process.exitCode = 1
}

cli
  .command('init', 'Create a config file')
  .option('--force', 'Overwrite existing config file')
  .action(async (options) => {
    try {
      const framework = (options.framework as WetwFramework | undefined) ?? (await askFramework())
      const file = await writeDefaultConfig({
        cwd: options.cwd,
        configFile: options.config,
        force: options.force,
        framework,
      })
      console.log(`Generated config at ${file}`)
    }
    catch (error) {
      handleError(error)
    }
  })

cli
  .command('list', 'List registry components')
  .option('--json', 'Emit list as JSON')
  .action(async (options) => {
    try {
      const config = await loadWetwConfig({
        cwd: options.cwd,
        configFile: options.config,
        overrides: {
          framework: options.framework,
        },
      })

      const registry = await resolveRegistry(config)
      if (options.json) {
        console.log(JSON.stringify(registry, null, 2))
        return
      }

      if (!registry.length) {
        console.log('Registry is empty')
        return
      }

      console.log('Available components:')
      console.log(`Framework: ${config.framework}`)
      for (const item of registry) {
        const description = item.description ? ` - ${item.description}` : ''
        console.log(`- ${item.name}${description}`)
      }
    }
    catch (error) {
      handleError(error)
    }
  })

cli
  .command('add <names...>', 'Add components to the project')
  .option('--force', 'Overwrite existing files')
  .action(async (names: string[], options) => {
    try {
      if (!names?.length) {
        throw new Error('wetw add <name...> expects at least one component')
      }

      await addComponents(names, {
        cwd: options.cwd,
        configFile: options.config,
        force: options.force,
        overrides: {
          framework: options.framework,
        },
      })
      console.log(`Added: ${names.join(', ')}`)
    }
    catch (error) {
      handleError(error)
    }
  })

cli.help()
cli.version(pkg.version ?? '0.0.0')

if (process.argv.length <= 2) {
  cli.outputHelp()
}

cli.parse()
