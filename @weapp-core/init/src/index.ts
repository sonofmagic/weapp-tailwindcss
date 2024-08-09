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
        console.log(`✨ 设置 ${projectConfigFilename} 配置文件成功!`)
      }

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
        set(packageJson, 'type', 'module')
        set(packageJson, 'scripts.open', `${command} open`)
        set(packageJson, 'scripts.build-npm', `${command} build-npm`)
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
        console.log(`✨ 设置 ${packageJsonFilename} 配置文件成功!`)
      }

      return packageJson
    }
    catch { }
  }
}

export function initViteConfigFile(options: SharedUpdateOptions) {
  const { root, write = true } = options
  const targetFilename = 'vite.config.ts'
  const viteConfigFilePath = path.resolve(root, targetFilename)
  const viteConfigFileCode = `import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    // weapp-vite options
  },
})
`
  if (write) {
    fs.outputFileSync(viteConfigFilePath, viteConfigFileCode, 'utf8')
    console.log(`✨ 设置 ${targetFilename} 配置文件成功!`)
  }
  return viteConfigFileCode
}

export function initTsDtsFile(options: SharedUpdateOptions) {
  const { root, write = true } = options
  const targetFilename = 'vite-env.d.ts'
  const viteDtsFilePath = path.resolve(root, targetFilename)
  const code = `/// <reference types="vite/client" />
`
  if (write) {
    fs.outputFileSync(viteDtsFilePath, code, 'utf8')
    console.log(`✨ 设置 ${targetFilename} 配置文件成功!`)
  }
  return code
}

export function initTsJsonFiles(options: SharedUpdateOptions) {
  const { root, write = true } = options
  const tsJsonFilename = 'tsconfig.json'
  const tsJsonFilePath = path.resolve(root, tsJsonFilename)
  const tsNodeJsonFilename = 'tsconfig.node.json'
  const tsNodeJsonFilePath = path.resolve(root, tsNodeJsonFilename)
  if (write) {
    fs.outputJSONSync(tsJsonFilePath, {
      compilerOptions: {
        target: 'ES2020',
        jsx: 'preserve',
        lib: [
          'ES2020',
          'DOM',
          'DOM.Iterable',
        ],
        useDefineForClassFields: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        allowImportingTsExtensions: true,
        allowJs: true,
        strict: true,
        noFallthroughCasesInSwitch: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noEmit: true,
        isolatedModules: true,
        skipLibCheck: true,
      },
      references: [
        {
          path: './tsconfig.node.json',
        },
      ],
      include: [
        'src/**/*.ts',
        'src/**/*.js',
      ],
    }, {
      encoding: 'utf8',
      spaces: 2,
    })
    console.log(`✨ 设置 ${tsJsonFilename} 配置文件成功!`)

    fs.outputJSONSync(tsNodeJsonFilePath, {
      compilerOptions: {
        composite: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
      include: [
        'vite.config.ts',
      ],
    }, {
      encoding: 'utf8',
      spaces: 2,
    })
    console.log(`✨ 设置 ${tsNodeJsonFilename} 配置文件成功!`)
  }
}

export function initConfig(options: { root?: string, command?: 'weapp-vite' }) {
  const { root = process.cwd(), command } = options
  updateProjectConfig({ root })
  updatePackageJson({ root, command })
  if (command === 'weapp-vite') {
    initViteConfigFile({ root })
    initTsDtsFile({ root })
    initTsJsonFiles({ root })
  }
}
