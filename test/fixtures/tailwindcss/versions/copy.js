import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function getCurrentFilename() {
  return fileURLToPath(import.meta.url)
}

function getTailwindcssVersion(str) {
  const match = /^tailwindcss([\d\.]*)$/.exec(str)
  if (match === null) {
    // 不是 tailwindcss
    return false
  } else if (match[1] === '') {
    return 'lts'
  } else {
    return match[1]
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, {
    recursive: true
  })
}

async function copyFiles(arr) {
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i++) {
      const { src, dest } = arr[i];
      await ensureDir(path.dirname(dest))

      const isExisted = await fs.access(src).then(() => true).catch(() => false)

      if (isExisted) {
        await fs.copyFile(src, dest)
      } else {
        console.warn(`[warning]: 404 ${src}`)
      }

    }
  }
}
const relativePaths = ['package.json', 'lib/index.js', 'lib/plugin.js', 'lib/processTailwindFeatures.js', 'lib/util/dataTypes.js']
// async function copyTargetFile() {

// }

async function main() {
  const filename = getCurrentFilename()
  const dirname = path.dirname(filename)
  const nodeModulesPath = path.resolve(dirname, 'node_modules')
  const filenames = await fs.readdir(nodeModulesPath)
  const pkgJson = await fs.readFile(path.resolve(dirname, 'package.json'), 'utf-8').then(res => {
    return JSON.parse(res)
  })
  const dependencies = pkgJson.dependencies
  const entries = Object.entries(dependencies)
  for (let i = 0; i < entries.length; i++) {
    const [localPkgName, _npmVersion] = entries[i];

    const version = getTailwindcssVersion(localPkgName)
    if (version && filenames.includes(localPkgName)) {
      const targetDir = path.resolve(dirname, version)
      await ensureDir(targetDir)
      await copyFiles(relativePaths.map(x => {
        return {
          src: path.resolve(nodeModulesPath, localPkgName, x),
          dest: path.resolve(targetDir, x)
        }
      }))
    }
  }

}

main()