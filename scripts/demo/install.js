const execa = require('execa')
const path = require('path')
const fs = require('fs').promises

const lockFileMap = {
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml'
}

const lockFileEntries = Object.entries(lockFileMap)

async function fileExist (pathLike) {
  try {
    await fs.access(pathLike)
    return true
  } catch (error) {
    return false
  }
}
// await execa('yarn add -D weapp-tailwindcss-webpack-plugin').stdout.pipe(process.stdout)

async function doInstall (pathLike) {
  const filenames = await fs.readdir(pathLike)
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]
    const p = path.resolve(pathLike, filename)
    const stat = await fs.stat(p)
    if (stat.isDirectory()) {
      process.chdir(p)
      if (await fileExist('package.json')) {
        for (let index = 0; index < lockFileEntries.length; index++) {
          const [pkgM, lockFile] = lockFileEntries[index]
          if (await fileExist(lockFile)) {
            execa(`${pkgM} install`).stdout.pipe(process.stdout)
            break
          }
        }
      }
    }
  }
}

;(async () => {
  const demoPath = path.resolve(__dirname, '../../demo')
  await doInstall(demoPath)
})()
