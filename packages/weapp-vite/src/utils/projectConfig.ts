import path from 'pathe'
import fs from 'fs-extra'

export function getProjectConfig(root: string, options?: { ignorePrivate?: boolean }) {
  const baseJsonPath = path.resolve(root, 'project.config.json')
  const privateJsonPath = path.resolve(root, 'project.private.config.json')
  let baseJson = {}
  let privateJson = {}
  if (fs.existsSync(baseJsonPath)) {
    baseJson = fs.readJsonSync(baseJsonPath) || {}
  }
  else {
    throw new Error(`在 ${root} 目录下找不到 project.config.json`)
  }
  if (!options?.ignorePrivate) {
    if (fs.existsSync(privateJsonPath)) {
      privateJson = fs.readJsonSync(privateJsonPath, {
        throws: false,
      }) || {}
    }
  }

  return Object.assign({}, privateJson, baseJson)
}
