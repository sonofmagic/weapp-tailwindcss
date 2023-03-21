import path from 'path'
import fs from 'fs'
import { gte as semverGte } from 'semver'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'
import type { PackageJson } from 'pkg-types'
import { noop } from '@/utils'
import { pluginName } from '@/constants'
import { findAstNode } from './supportCustomUnit'
import { inspectPostcssPlugin, inspectProcessTailwindFeaturesReturnContext } from './inspector'
import { generate } from '@/babel'

export function getInstalledPkgJsonPath(options: ILengthUnitsPatchOptions) {
  const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  try {
    // const cwd = process.cwd()
    const tmpJsonPath = require.resolve(`${dangerousOptions.packageName}/package.json`, {
      paths: options.paths
    })
    // `${cwd}/node_modules/${dangerousOptions.packageName}/package.json`
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

function ensureFileContent(filepaths: string | string[]) {
  if (typeof filepaths === 'string') {
    filepaths = [filepaths]
  }
  let content
  for (let i = 0; i < filepaths.length; i++) {
    const filepath = filepaths[i]
    if (fs.existsSync(filepath)) {
      content = fs.readFileSync(filepath, {
        encoding: 'utf-8'
      })
      break
    }
  }
  return content
}
export function monkeyPatchForExposingContext(rootDir: string, overwrite: boolean) {
  const processTailwindFeaturesFilePath = path.resolve(rootDir, 'lib/processTailwindFeatures.js')

  const processTailwindFeaturesContent = ensureFileContent(processTailwindFeaturesFilePath)
  const result: Record<string, string | null> = {
    processTailwindFeatures: null,
    plugin: null
  }
  if (processTailwindFeaturesContent) {
    const { code, hasPatched } = inspectProcessTailwindFeaturesReturnContext(processTailwindFeaturesContent)
    if (!hasPatched && overwrite) {
      fs.writeFileSync(processTailwindFeaturesFilePath, code, {
        encoding: 'utf-8'
      })
      console.log('patch tailwindcss processTailwindFeatures for return content successfully!')
    }
    result.processTailwindFeatures = code
  }

  const pluginFilePath = path.resolve(rootDir, 'lib/plugin.js')
  const indexFilePath = path.resolve(rootDir, 'lib/index.js')
  const pluginContent = ensureFileContent([pluginFilePath, indexFilePath])
  if (pluginContent) {
    const { code: code0, hasPatched: hasPatched0 } = inspectPostcssPlugin(pluginContent)
    if (!hasPatched0 && overwrite) {
      fs.writeFileSync(pluginFilePath, code0, {
        encoding: 'utf-8'
      })
      console.log('patch tailwindcss for expose runtime content successfully!')
    }
    result.plugin = code0
  }
  return result
}

export function monkeyPatchForSupportingCustomUnit(rootDir: string, options: ILengthUnitsPatchOptions) {
  const { dangerousOptions } = options
  const DOPTS = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  const dataTypesFilePath = path.resolve(rootDir, DOPTS.lengthUnitsFilePath)
  const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
    encoding: 'utf-8'
  })
  const { arrayRef, changed } = findAstNode(dataTypesFileContent, options)
  if (arrayRef && changed) {
    // @ts-ignore
    const { code } = generate(arrayRef, {
      jsescOption: {
        quotes: 'single'
      }
    })

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
    }
    return code
  }
}

export function internalPatch(pkgJsonPath: string | undefined, options: ILengthUnitsPatchOptions, overwrite: boolean = true) {
  if (pkgJsonPath) {
    const rootDir = path.dirname(pkgJsonPath)
    const dataTypes = monkeyPatchForSupportingCustomUnit(rootDir, options)
    const result = monkeyPatchForExposingContext(rootDir, overwrite)
    return {
      ...result,
      dataTypes
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
