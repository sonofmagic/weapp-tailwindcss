import { Command } from 'commander'

export function createCli() {
  const program = new Command()

  program
    .command('dev')
    .alias('serve')
    .action(() => {})

  program.command('build').action(() => {})

  program.command('init').action(() => {})

  program.command('watch').action(() => {})

  return program
}
