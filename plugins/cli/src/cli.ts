import { Command } from 'commander'
import defu from 'defu'
import loadPostcssConfig from 'postcss-load-config'
import { build } from '@/build'
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
      // const postcssOptions = await loadPostcssConfig()
    })

  program.command('build').action(async () => {
    const postcssOptions = await loadPostcssConfig()

    await build(
      defu(userDefinedConfig?.config, {
        root: cwd,
        weappTailwindcssOptions: {
          postcssOptions
        }
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
