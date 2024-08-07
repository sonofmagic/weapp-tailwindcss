import process from 'node:process'
import { program } from 'commander'
import { initConfig } from '@weapp-core/init'
import { parse } from 'weapp-ide-cli'
import { runDev, runProd } from './build'
import logger from './logger'

program
  .command('dev').action(async () => {
    await runDev()
  })

program
  .command('build').action(async () => {
    await runProd()
  })

program
  .command('init').action(() => {
    initConfig({
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
