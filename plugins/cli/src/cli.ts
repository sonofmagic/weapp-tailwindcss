import type { BuildOptions } from './type'
import process from 'node:process'
import { build, clean, watch } from '@/build'
import { createConfigLoader, initConfig } from '@/config'
import { Command } from 'commander'
import defu from 'defu'

export function createCli() {
  const cwd = process.cwd()
  const program = new Command()

  const configLoader = createConfigLoader(cwd)
  const userDefinedConfig = configLoader.search(cwd)

  program
    .command('dev')
    .alias('serve')
    .action(async () => {
      await watch(
        defu<Partial<BuildOptions>, Partial<BuildOptions>[]>(userDefinedConfig?.config, {
          root: cwd,
        }),
      )
    })

  program.command('build').action(async () => {
    await build(
      defu<Partial<BuildOptions>, Partial<BuildOptions>[]>(userDefinedConfig?.config, {
        root: cwd,
      }),
    )
  })

  program.command('init').action(() => {
    initConfig({
      root: cwd,
    })
  })

  program.command('clean').action(async () => {
    await clean(
      defu<Partial<BuildOptions>, Partial<BuildOptions>[]>(userDefinedConfig?.config, {
        root: cwd,
      }),
    )
  })

  // program.command('watch').action(() => {})

  return program
}
