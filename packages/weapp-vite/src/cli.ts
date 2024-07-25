import { program } from 'commander'
import { runDev, runProd } from './build'

program
  .command('dev').action(async () => {
    await runDev()
  })

program
  .command('build').action(async () => {
    await runProd()
  })

program.parse()
