import process from 'node:process'
import fs from 'fs-extra'
import path from 'pathe'

async function setJson(p, key, flag) {
  const json = (await fs.exists(p)) ? JSON.parse(await fs.readFile(p, 'utf8')) : {}
  json[key] = flag
  await fs.writeFile(p, JSON.stringify(json, null, 2), 'utf8')
}

const divideString = '-'.repeat(process.stdout.columns)

async function run(dirPath, command) {
  const { execaCommand } = await import('execa')
  await execaCommand(`yarn ${command}`, {
    cwd: dirPath,
    stdio: 'inherit',
  })
  const filenames = await fs.readdir(dirPath)
  for (const filename of filenames) {
    const baseDir = path.resolve(dirPath, filename)
    const stat = await fs.stat(baseDir)
    if (stat.isDirectory()) {
      const pkgPath = path.resolve(baseDir, 'package.json')
      if (await fs.exists(pkgPath)) {
        console.log(divideString)
        console.log(`[${filename}]:${baseDir}`)
        console.log(divideString)
        try {
          await execaCommand(`yarn ${command}`, {
            cwd: baseDir,
            stdio: 'inherit',
          })
          // .pipeStdout(process.stdout)
          await setJson(path.resolve(dirPath, 'result.json'), filename, true)
        }
        catch {
          await setJson(path.resolve(dirPath, 'result.json'), filename, false)
        }
      }
    }
  }
}

export {
  run,
}
