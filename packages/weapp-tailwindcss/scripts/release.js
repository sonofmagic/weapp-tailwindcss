const path = require('node:path')
const process = require('node:process')
const fs = require('fs-extra')
// 'weapp-tailwindcss',
const pluginNames = ['weapp-tailwindcss', 'weapp-tailwindcss-webpack-plugin', 'weapp-tw']

// pnpm publish --access public --no-git-checks

async function main() {
  const { execa } = await import('execa')
  const pkgJsonPath = path.resolve(__dirname, '../package.json')
  const pkgJson = await fs.readJSON(pkgJsonPath)
  const pkgName = pkgJson.name

  for (const pluginName of pluginNames) {
    try {
      await fs.writeJSON(pkgJsonPath, { ...pkgJson, name: pluginName })
      await execa('pnpm', ['publish', '--access', 'public', '--no-git-checks'], {
        stdout: process.stdout,
      })
      // .pipeStdout(process.stdout)
    }
    catch (error) {
      console.error(error)
    }
  }
  await fs.writeJSON(pkgJsonPath, { ...pkgJson, name: pkgName }, { spaces: 2 })
}

main()
