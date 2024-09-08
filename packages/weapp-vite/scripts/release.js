import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import fs from 'fs-extra'

const __dirname = dirname(fileURLToPath(import.meta.url))
// const path = require('node:path')
// const fs = require('fs-extra')

const pluginNames = ['weapp-vite', 'vite-plugin-weapp']

// pnpm publish --access public --no-git-checks

async function main() {
  // const { execa } = await import('execa')
  const pkgJsonPath = path.resolve(__dirname, '../package.json')
  const pkgJson = await fs.readJSON(pkgJsonPath)
  const pkgName = pkgJson.name

  for (const pluginName of pluginNames) {
    try {
      await fs.writeJSON(pkgJsonPath, { ...pkgJson, name: pluginName })
      const { stdout } = await execa('pnpm', ['publish', '--access', 'public', '--no-git-checks'])
      console.log(stdout)
      // .pipeStdout(process.stdout)
    }
    catch (error) {
      console.error(error)
    }
  }
  await fs.writeJSON(pkgJsonPath, { ...pkgJson, name: pkgName }, { spaces: 2 })
}

main()
