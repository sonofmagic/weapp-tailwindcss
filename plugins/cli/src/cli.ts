import { Command } from 'commander'

export function createCli() {
  const program = new Command()

  program.command('dev').alias('serve')

  program.command('build')

  program.command('init')

  program.command('watch')

  return program
}
