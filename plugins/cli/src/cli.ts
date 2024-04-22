import { Command } from 'commander'
import defu from 'defu'
import { build, watch } from '@/build'
import { createConfigLoader, initConfig } from '@/config'

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
        defu(userDefinedConfig?.config, {
          root: cwd
        })
      )
    })

  program.command('build').action(async () => {
    await build(
      defu(userDefinedConfig?.config, {
        root: cwd
      })
    )
  })

  program.command('init').action(() => {
    initConfig({
      root: cwd
    })
  })

  // program.command('watch').action(() => {})

  return program
}
