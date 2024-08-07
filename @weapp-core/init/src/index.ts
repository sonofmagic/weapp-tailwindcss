import path from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import { get, set } from '@weapp-core/shared'

export interface SetMethod {
  (path: set.InputType, value: any, options?: set.Options): void
}

export interface SharedUpdateOptions {
  root: string
  dest?: string
  write?: boolean
  cb?: (set: SetMethod) => void
}

export interface UpdateProjectConfigOptions extends SharedUpdateOptions {

}

export interface UpdatePackageJsonOptions extends SharedUpdateOptions {
  command?: 'weapp-vite'
}

export function updateProjectConfig(options: UpdateProjectConfigOptions) {
  const { root, dest, cb, write = true } = options
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
      cb?.(
        (...args) => {
          set(projectConfig, ...args)
        },
      )
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
      if (write) {
        fs.outputJSONSync(dest ?? projectConfigPath, projectConfig, {
          spaces: 2,
        })
      }

      console.log(`✨ 设置 ${projectConfigFilename} 配置文件成功!`)

      return projectConfig
    }
    catch {
      console.warn(`✨ 设置 ${projectConfigFilename} 配置文件失败!`)
    }
  }
  else {
    console.warn(`✨ 没有找到 ${projectConfigFilename} 文件!`)
  }
}

export function updatePackageJson(options: UpdatePackageJsonOptions) {
  const { root, dest, command, cb, write = true } = options
  const packageJsonFilename = 'package.json'
  const packageJsonPath = path.resolve(root, packageJsonFilename)
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = fs.readJSONSync(packageJsonPath) as {
        scripts: Record<string, string>
      }
      set(packageJson, 'scripts.dev', `${command} dev`)
      set(packageJson, 'scripts.build', `${command} build`)
      if (command === 'weapp-vite') {
        set(packageJson, 'scripts.open', `${command} open`)
      }
      cb?.(
        (...args) => {
          set(packageJson, ...args)
        },
      )
      if (write) {
        fs.outputJSONSync(dest ?? packageJsonPath, packageJson, {
          spaces: 2,
        })
      }

      return packageJson
    }
    catch { }
  }
}

export function initViteConfigFile(options: SharedUpdateOptions) {
  const { root, write = true } = options
  const viteConfigFile = path.resolve(root, 'vite.config.ts')
  const code = `import { defineConfig } from 'weapp-vite/config'

export default defineConfig({})
`
  if (write) {
    fs.outputFileSync(viteConfigFile, code, 'utf8')
  }
  return code
}

export function initConfig(options: { root?: string, command?: 'weapp-vite' }) {
  const { root = process.cwd(), command } = options
  updateProjectConfig({ root })
  updatePackageJson({ root, command })
  if (command === 'weapp-vite') {
    initViteConfigFile({ root })
  }
}
