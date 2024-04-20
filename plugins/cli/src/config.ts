import path from 'node:path'
import { cosmiconfigSync } from 'cosmiconfig'
import defu from 'defu'
import type { UserDefinedOptions } from 'weapp-tailwindcss'
import fs from 'fs-extra'
import loadConfig from 'postcss-load-config'
import type { Result } from 'postcss-load-config'

export function createConfigLoader(root: string = process.cwd()) {
  const explorer = cosmiconfigSync('weapp-tw')

  function search(searchFrom: string = root) {
    const searchFor = explorer.search(searchFrom)
    if (searchFor) {
      searchFor.config = defu<UserConfig, UserConfig[]>(searchFor.config, getDefaultConfig(root))
      return searchFor
    }
  }

  function load(filepath: string) {
    return explorer.load(filepath)
  }

  return {
    search,
    load
  }
}

export function getDefaultConfig(root: string): UserConfig {
  return {
    outDir: 'dist',
    root,
    srcDir: '.'
  }
}

export type UserConfig = {
  outDir?: string
  root?: string
  srcDir?: string
  weappTailwindcssOptions?: UserDefinedOptions
  clean?: boolean
}

export function defineConfig(options: UserConfig) {
  return options
}

export interface InitConfigOptions {
  lang?: 'js' | 'ts'
  root?: string
}

export function updateProjectConfig(options: { root: string; dest?: string }) {
  const { root, dest } = options
  const projectConfigPath = path.resolve(root, 'project.config.json')
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
      projectConfig.miniprogramRoot = 'dist/'
      projectConfig.srcMiniprogramRoot = 'dist/'

      projectConfig.setting.packNpmManually = true
      if (Array.isArray(projectConfig.setting.packNpmRelationList)) {
        const x = projectConfig.setting.packNpmRelationList.find((x) => x.packageJsonPath === './package.json' && x.miniprogramNpmDistDir === './dist')
        if (!x) {
          projectConfig.setting.packNpmRelationList.push({
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist'
          })
        }
      } else {
        projectConfig.setting.packNpmRelationList = [
          {
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist'
          }
        ]
      }
      fs.outputJSONSync(dest ?? projectConfigPath, projectConfig)

      console.log(`✨ 设置 ${projectConfigPath} 配置文件成功!`)
    } catch {
      console.warn(`✨ 设置 ${projectConfigPath} 配置文件失败!`)
    }
  } else {
    console.warn(`✨ 没有找到 project.config.json 文件!`)
  }
}

export function initConfig(options?: InitConfigOptions) {
  const { lang, root } = defu<InitConfigOptions, InitConfigOptions[]>(options, { lang: 'js', root: process.cwd() }) as Required<InitConfigOptions>
  const configFilename = `weapp-tw.config.${lang ?? 'js'}`
  const configPath = path.resolve(root, configFilename)

  // const tsconfigPath = path.resolve(root, 'tsconfig.json')

  fs.ensureDirSync(root)
  if (lang === 'ts') {
    fs.writeFileSync(
      configPath,
      `import { defineConfig } from '@weapp-tailwindcss/cli'

export default defineConfig({})
`,
      'utf8'
    )
  } else {
    fs.writeFileSync(
      configPath,
      `/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
module.exports = {}
`,
      'utf8'
    )
  }
  console.log(`✨ ${configFilename} 配置文件，初始化成功!`)

  // const isTs = fs.existsSync(tsconfigPath)
  updateProjectConfig({ root })
  // const postcssConfigPath = path.resolve(root, 'postcss.config.js')
  return configPath
}
