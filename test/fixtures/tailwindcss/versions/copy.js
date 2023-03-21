import fs from 'node:fs/promises'
import path from 'node:path'

import { copyFiles, ensureDir, getCurrentFilename } from './utils.js'
function getTailwindcssVersion (str) {
  // eslint-disable-next-line no-useless-escape
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

const relativePaths = ['package.json', 'lib/index.js', 'lib/plugin.js', 'lib/processTailwindFeatures.js', 'lib/util/dataTypes.js']
// async function copyTargetFile() {

// }

async function main () {
  const filename = getCurrentFilename(import.meta.url)
  const dirname = path.dirname(filename)
  const nodeModulesPath = path.resolve(dirname, 'node_modules')
  const filenames = await fs.readdir(nodeModulesPath)
  const pkgJson = await fs.readFile(path.resolve(dirname, 'package.json'), 'utf-8').then(res => {
    return JSON.parse(res)
  })
  const dependencies = pkgJson.dependencies
  const entries = Object.entries(dependencies)
  for (let i = 0; i < entries.length; i++) {
    const [localPkgName] = entries[i]

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
