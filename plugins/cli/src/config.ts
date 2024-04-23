import path from 'node:path'
import { cosmiconfigSync } from 'cosmiconfig'
import defu from 'defu'
import fs from 'fs-extra'
import { get, set } from './utils'
import { BuildOptions } from '@/type'

export type WeappTwCosmiconfigResult = {
  config: BuildOptions
  filepath: string
  isEmpty?: boolean
}

export function createConfigLoader(root: string) {
  const explorer = cosmiconfigSync('weapp-tw')

  function search(searchFrom: string = root): WeappTwCosmiconfigResult | undefined {
    const searchFor = explorer.search(searchFrom)
    if (searchFor) {
      searchFor.config = defu<BuildOptions, Partial<BuildOptions>[]>(searchFor.config, getDefaultConfig(root))
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

export function getDefaultConfig(root: string): Partial<BuildOptions> {
  return {
    outDir: 'dist',
    root,
    src: '.'
  }
}

export function defineConfig(options: Partial<BuildOptions>) {
  return options
}

export interface InitConfigOptions {
  lang?: 'js' | 'ts'
  root?: string
}

export function updateProjectConfig(options: { root: string; dest?: string }) {
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
        const x = projectConfig.setting.packNpmRelationList.find((x) => x.packageJsonPath === './package.json' && x.miniprogramNpmDistDir === './dist')
        if (!x) {
          projectConfig.setting.packNpmRelationList.push({
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist'
          })
        }
      } else {
        set(projectConfig, 'setting.packNpmRelationList', [
          {
            packageJsonPath: './package.json',
            miniprogramNpmDistDir: './dist'
          }
        ])
      }
      fs.outputJSONSync(dest ?? projectConfigPath, projectConfig, {
        spaces: 2
      })

      console.log(`✨ 设置 ${projectConfigFilename} 配置文件成功!`)
    } catch {
      console.warn(`✨ 设置 ${projectConfigFilename} 配置文件失败!`)
    }
  } else {
    console.warn(`✨ 没有找到 ${projectConfigFilename} 文件!`)
  }
}

export function updatePackageJson(options: { root: string; dest?: string }) {
  const { root, dest } = options
  const packageJsonFilename = 'package.json'
  const packageJsonPath = path.resolve(root, packageJsonFilename)
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = fs.readJSONSync(packageJsonPath) as {
        scripts: Record<string, string>
      }
      set(packageJson, 'scripts.dev', 'weapp-tw dev')
      set(packageJson, 'scripts.build', 'weapp-tw build')
      fs.outputJSONSync(dest ?? packageJsonPath, packageJson, {
        spaces: 2
      })
    } catch {}
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

  updateProjectConfig({ root })
  updatePackageJson({ root })
  return configPath
}
