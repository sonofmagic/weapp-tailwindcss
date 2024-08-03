import process from 'node:process'
import { program } from 'commander'
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

program.parse()
