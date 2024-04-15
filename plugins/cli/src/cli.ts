import { Command } from 'commander'

export function createCli() {
  const program = new Command()

  program.command('watch').option('--first').option('-s, --separator <char>')

  return program
}
