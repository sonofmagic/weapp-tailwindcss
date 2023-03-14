import path from 'path'
import fs from 'fs'
import { gte as semverGte } from 'semver'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'
import type { PackageJson } from 'pkg-types'
import { noop } from '@/utils'
import { pluginName } from '@/constants'
import { findAstNode } from './supportCustomUnit'
import { inspectPostcssPlugin, inspectProcessTailwindFeaturesReturnContext } from './inspector'

export function getInstalledPkgJsonPath(options: ILengthUnitsPatchOptions) {
  const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  try {
    const tmpJsonPath = require.resolve(`${dangerousOptions.packageName}/package.json`, {
      paths: options.paths
    })
    const pkgJson = require(tmpJsonPath) as PackageJson
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
    // https://github.com/tailwindlabs/tailwindcss/discussions/9675
    if (semverGte(pkgJson.version!, dangerousOptions.gteVersion)) {
      return tmpJsonPath
    }
  } catch (error) {
    if ((<Error & { code: string }>error).code === 'MODULE_NOT_FOUND') {
      console.warn('没有找到`tailwindcss`包，请确认是否安装。想要禁用打上rpx支持patch或者非`tailwindcss`框架，你可以设置 `supportCustomLengthUnitsPatch` 为 false')
    }
  }
}

export function createPatch(options: false | ILengthUnitsPatchOptions) {
  if (options === false) {
    return noop
  }
  return () => {
    try {
      return internalPatch(getInstalledPkgJsonPath(options), options)
    } catch (error) {
      console.warn(`patch tailwindcss failed:` + (<Error>error).message)
    }
  }
}

export function internalPatch(pkgJsonPath: string | undefined, options: ILengthUnitsPatchOptions) {
  const { dangerousOptions } = options
  const DOPTS = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  if (pkgJsonPath) {
    const rootDir = path.dirname(pkgJsonPath)

    const processTailwindFeaturesFilePath = path.resolve(rootDir, 'lib/processTailwindFeatures.js')

    const processTailwindFeaturesContent = fs.readFileSync(processTailwindFeaturesFilePath, {
      encoding: 'utf-8'
    })
    const { code, hasPatched } = inspectProcessTailwindFeaturesReturnContext(processTailwindFeaturesContent)
    if (!hasPatched) {
      fs.writeFileSync(processTailwindFeaturesFilePath, code, {
        encoding: 'utf-8'
      })
    }
    const pluginFilePath = path.resolve(rootDir, 'lib/plugin.js')
    const pluginContent = fs.readFileSync(pluginFilePath, {
      encoding: 'utf-8'
    })
    const { code: code0, hasPatched: hasPatched0 } = inspectPostcssPlugin(pluginContent)
    if (!hasPatched0) {
      fs.writeFileSync(pluginFilePath, code0, {
        encoding: 'utf-8'
      })
    }

    const dataTypesFilePath = path.resolve(rootDir, DOPTS.lengthUnitsFilePath)
    const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
      encoding: 'utf-8'
    })
    const { arrayRef, changed } = findAstNode(dataTypesFileContent, options)
    if (arrayRef && changed) {
      // @ts-ignore
      const { code } = generate(arrayRef)
      if (arrayRef.start && arrayRef.end) {
        const prev = dataTypesFileContent.slice(0, arrayRef.start)
        const next = dataTypesFileContent.slice(arrayRef.end as number)
        const newCode = prev + code + next
        if (DOPTS.overwrite) {
          fs.writeFileSync(DOPTS.destPath ?? dataTypesFilePath, newCode, {
            encoding: 'utf-8'
          })
          console.log('patch tailwindcss for custom length unit successfully!')
        }

        return newCode
      }
    }
  }
}

export function mkCacheDirectory(cwd = process.cwd()) {
  const cacheDirectory = path.resolve(cwd, 'node_modules', '.cache', pluginName)

  const exists = fs.existsSync(cacheDirectory)
  if (!exists) {
    fs.mkdirSync(cacheDirectory, {
      recursive: true
    })
  }
  return cacheDirectory
}
