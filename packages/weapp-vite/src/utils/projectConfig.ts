import fs from 'fs-extra'
import path from 'pathe'

export interface ProjectConfig {
  miniprogramRoot?: string
  srcMiniprogramRoot?: string
}

export function getProjectConfig(root: string, options?: { ignorePrivate?: boolean }): ProjectConfig {
  const baseJsonPath = path.resolve(root, 'project.config.json')
  const privateJsonPath = path.resolve(root, 'project.private.config.json')
  let baseJson = {}
  let privateJson = {}
  if (fs.existsSync(baseJsonPath)) {
    try {
      baseJson = fs.readJsonSync(baseJsonPath) || {}
    }
    catch {
      throw new Error(`解析 json 格式失败, project.config.json 为非法的 json 格式`)
    }
  }
  else {
    throw new Error(`在 ${root} 目录下找不到 project.config.json`)
  }
  if (!options?.ignorePrivate) {
    if (fs.existsSync(privateJsonPath)) {
      try {
        privateJson = fs.readJsonSync(privateJsonPath) || {}
      }
      catch {
        throw new Error(`解析 json 格式失败, project.private.config.json 为非法的 json 格式`)
      }
    }
  }

  return Object.assign({}, privateJson, baseJson)
}
