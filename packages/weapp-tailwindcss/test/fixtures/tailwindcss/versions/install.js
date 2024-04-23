import { execa } from 'execa'
// import { getCurrentFilename } from './utils.js'
// import path from 'path'
// import fs from 'fs/promises'

const args = process.argv.slice(2)

const version = args[0]

if (version) {
  try {
    const cwd = process.cwd()
    // pnpm EPERM: operation not permitted,
    // try yarn 
    const { stdout } = await execa('yarn', ['add', `tailwindcss${version}@npm:tailwindcss@${version}`], {
      cwd
    }).pipeStdout(process.stdout)
    // const filename = getCurrentFilename(import.meta.url)
    // const dirname = path.dirname(filename)
    // const nodeModulesPath = path.resolve(dirname, 'node_modules')
    // await fs.rmdir(path.resolve(nodeModulesPath, '.bin'))
    console.log(stdout)
  } catch (error) {
    console.error(error)
  }
} else {
  console.warn('version is required!')
}
