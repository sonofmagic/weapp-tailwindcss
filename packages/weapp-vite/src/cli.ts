import process from 'node:process'
import { program } from 'commander'
import { initConfig } from '@weapp-core/init'
import { runDev, runProd } from './build'

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

program.parse()
