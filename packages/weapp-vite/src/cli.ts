import process from 'node:process'
import { program } from 'commander'
import { runDev, runProd } from './build'

program
  .command('dev').action(async () => {
    const cwd = process.cwd()
    await runDev(cwd)
  })

program
  .command('build').action(async () => {
    const cwd = process.cwd()
    await runProd(cwd)
  })

program.parse()
