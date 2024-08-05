import process from 'node:process'
import { program } from 'commander'
import { initConfig } from '@weapp-core/init'
import { parse } from 'weapp-ide-cli'
import { runDev, runProd } from './build'
import logger from './logger'

const cwd = process.cwd()

program
  .command('dev').action(async () => {
    await runDev(cwd)
  })

program
  .command('build').action(async () => {
    await runProd(cwd)
  })

program
  .command('init').action(() => {
    initConfig({
      root: cwd,
      command: 'weapp-vite',
    })
  })

program
  .command('open').action(async () => {
    try {
      await parse(['open', '-p'])
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
  })

program.parse()
