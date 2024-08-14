import process from 'node:process'
import { program } from 'commander'
import { initConfig } from '@weapp-core/init'
import { parse } from 'weapp-ide-cli'
import { runDev, runProd } from './build'
import logger from './logger'
import { createContext } from './context'

program
  .command('dev').action(async () => {
    const ctx = createContext()
    ctx.isDev = true
    await runDev(ctx)
  })

program
  .command('build').action(async () => {
    const ctx = createContext()
    await runProd(ctx)
  })

program
  .command('init').action(() => {
    try {
      initConfig({
        command: 'weapp-vite',
      })
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
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

program
  .command('build-npm').alias('build:npm').action(async () => {
    try {
      await parse(['build-npm', '-p'])
    }
    catch (error) {
      logger.error(error)
    }
    finally {
      process.exit()
    }
  })

program.parse()
