import { execa } from 'execa';
const args = process.argv.slice(2)

const version = args[0]

if (version) {
  try {
    const { stdout } = await execa('pnpm', ['add', `tailwindcss${version}@npm:tailwindcss@${version}`], {
      cwd: process.cwd()
    }).pipeStdout(process.stdout);

    console.log(stdout);
  } catch (error) {
    console.error(error)
  }

} else {
  console.warn('version is required!')
}


