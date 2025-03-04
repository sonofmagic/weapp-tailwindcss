import type { PackageJson } from 'pkg-types'
// import process from 'node:process'
import consola from 'consola'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import { getPackageInfo } from 'local-pkg'
import path from 'pathe'

async function setJson(p: string, key: string, flag: any) {
  const json = (await fs.exists(p)) ? JSON.parse(await fs.readFile(p, 'utf8')) : {}
  json[key] = flag
  await fs.writeFile(p, JSON.stringify(json, null, 2), 'utf8')
}

// const divideString = '-'.repeat(process.stdout.columns)

type PackageInfo = {
  name: string
  version: string | undefined
  rootPath: string
  packageJsonPath: string
  packageJson: PackageJson
} | undefined

type CommandCallback = string | ((pkgInfo: PackageInfo) => string)

async function execa(opts: {
  command: CommandCallback
  cwd: string
}) {
  const { command, cwd } = opts
  let cmd = typeof command === 'string' ? command : ''
  if (typeof command === 'function') {
    const pkgInfo = await getPackageInfo(cwd)
    cmd = command(pkgInfo)
  }
  return await execaCommand(cmd, {
    cwd,
    stdio: 'inherit',
  })
}

async function run(dirPath: string, command: CommandCallback) {
  await execa({
    command,
    cwd: dirPath,
  })

  const filenames = await fs.readdir(dirPath)
  for (const filename of filenames) {
    const baseDir = path.resolve(dirPath, filename)
    const stat = await fs.stat(baseDir)
    if (stat.isDirectory()) {
      const pkgPath = path.resolve(baseDir, 'package.json')
      if (await fs.exists(pkgPath)) {
        // console.log(divideString)
        // console.log(`[${filename}]:${baseDir}`)
        // console.log(divideString)
        try {
          await execa({
            command,
            cwd: baseDir,
          })
          await setJson(path.resolve(dirPath, 'result.json'), filename, true)
        }
        catch (e) {
          consola.error(e)
          await setJson(path.resolve(dirPath, 'result.json'), filename, false)
        }
      }
    }
  }
}

export {
  run,
}
