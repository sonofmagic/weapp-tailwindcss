import path from 'node:path'
import fs from 'fs-extra'
import { get, set } from '@weapp-core/shared'

export function updateProjectConfig(options: { root: string, dest?: string }) {
  const { root, dest } = options
  const projectConfigFilename = 'project.config.json'
  const projectConfigPath = path.resolve(root, projectConfigFilename)
  if (fs.existsSync(projectConfigPath)) {
    try {
      const projectConfig = fs.readJSONSync(projectConfigPath) as {
        miniprogramRoot?: string
        srcMiniprogramRoot?: string
        setting: {
          packNpmManually: boolean
          packNpmRelationList: {
            packageJsonPath: string
            miniprogramNpmDistDir: string
          }[]
        }
      }

      set(projectConfig, 'miniprogramRoot', 'dist/')
      set(projectConfig, 'srcMiniprogramRoot', 'dist/')
      set(projectConfig, 'setting.packNpmManually', true)

      if (Array.isArray(get(projectConfig, 'setting.packNpmRelationList'))) {
        const x = projectConfig.setting.packNpmRelationList.find(
          x => x.packageJsonPath === './package.json' && x.miniprogramNpmDistDir === './dist',
        )
        if (!x) {
          projectConfig.setting.packNpmRelationList.push({
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist',
          })
        }
      }
      else {
        set(projectConfig, 'setting.packNpmRelationList', [
          {
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist',
          },
        ])
      }
      fs.outputJSONSync(dest ?? projectConfigPath, projectConfig, {
        spaces: 2,
      })

      console.log(`✨ 设置 ${projectConfigFilename} 配置文件成功!`)
    }
    catch {
      console.warn(`✨ 设置 ${projectConfigFilename} 配置文件失败!`)
    }
  }
  else {
    console.warn(`✨ 没有找到 ${projectConfigFilename} 文件!`)
  }
}

export function updatePackageJson(options: { root: string, dest?: string, command?: string }) {
  const { root, dest, command } = options
  const packageJsonFilename = 'package.json'
  const packageJsonPath = path.resolve(root, packageJsonFilename)
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = fs.readJSONSync(packageJsonPath) as {
        scripts: Record<string, string>
      }
      set(packageJson, 'scripts.dev', `${command} dev`)
      set(packageJson, 'scripts.build', `${command} build`)

      fs.outputJSONSync(dest ?? packageJsonPath, packageJson, {
        spaces: 2,
      })
    }
    catch { }
  }
}

export function initConfig(options: { root: string, command?: string }) {
  const { root, command } = options
  updateProjectConfig({ root })
  updatePackageJson({ root, command })
}
