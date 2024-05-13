import path from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import { gte as semverGte } from 'semver'
import type { PackageJson } from 'pkg-types'
import { TailwindcssPatcher, monkeyPatchForExposingContext, requireResolve } from 'tailwindcss-patch'
import { findAstNode } from './supportCustomUnit'
import type { ILengthUnitsPatchDangerousOptions, ILengthUnitsPatchOptions, InternalPatchResult } from '@/types'
import { noop } from '@/utils'
import { pluginName } from '@/constants'
import { generate } from '@/babel'

// `${cwd}/node_modules/${dangerousOptions.packageName}/package.json`
// const pkgJson = require(tmpJsonPath) as PackageJson
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
// https://github.com/tailwindlabs/tailwindcss/discussions/9675
// if (semverGte(pkgJson.version!, dangerousOptions.gteVersion)) {
// }
// const cwd = process.cwd()
export function getInstalledPkgJsonPath(options: ILengthUnitsPatchOptions) {
  const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  try {
    const tmpJsonPath = requireResolve(`${dangerousOptions.packageName}/package.json`, {
      paths: options.paths,
      basedir: options.basedir,
    })

    return tmpJsonPath
  }
  catch (error) {
    if ((<Error & { code: string }>error).code === 'MODULE_NOT_FOUND') {
      console.warn(
        '没有找到`tailwindcss`包，请确认是否安装。想要禁用打上rpx支持patch或者非`tailwindcss`框架，你可以设置 `supportCustomLengthUnitsPatch` 为 false',
      )
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
    }
    catch (error) {
      console.warn(`patch tailwindcss failed:${(<Error>error).message}`)
    }
  }
}

export function monkeyPatchForSupportingCustomUnit(rootDir: string, options: ILengthUnitsPatchOptions) {
  const { dangerousOptions } = options
  const DOPTS = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  const dataTypesFilePath = path.resolve(rootDir, DOPTS.lengthUnitsFilePath)
  const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
    encoding: 'utf8',
  })
  const { arrayRef, changed } = findAstNode(dataTypesFileContent, options)
  if (arrayRef && changed) {
    const { code } = generate(arrayRef, {
      jsescOption: {
        quotes: 'single',
      },
    })

    if (arrayRef.start && arrayRef.end) {
      const prev = dataTypesFileContent.slice(0, arrayRef.start)
      const next = dataTypesFileContent.slice(arrayRef.end as number)
      const newCode = prev + code + next
      if (DOPTS.overwrite) {
        fs.writeFileSync(DOPTS.destPath ?? dataTypesFilePath, newCode, {
          encoding: 'utf8',
        })
        console.log('patch tailwindcss for custom length unit successfully!')
      }
    }
    return code
  }
}

export function internalPatch(
  pkgJsonPath: string | undefined,
  options: ILengthUnitsPatchOptions,
  overwrite = true,
): InternalPatchResult | undefined {
  if (pkgJsonPath) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as PackageJson
    const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
    const version = pkgJson.version!
    if (semverGte(version, dangerousOptions.gteVersion)) {
      const rootDir = path.dirname(pkgJsonPath)
      const dataTypes = monkeyPatchForSupportingCustomUnit(rootDir, options)
      const result = monkeyPatchForExposingContext(rootDir, {
        overwrite,
        version,
      })
      return {
        ...result,
        dataTypes,
      }
    }
  }
}

export function mkCacheDirectory(cwd = process.cwd()) {
  const cacheDirectory = path.resolve(cwd, 'node_modules', '.cache', pluginName)

  const exists = fs.existsSync(cacheDirectory)
  if (!exists) {
    fs.mkdirSync(cacheDirectory, {
      recursive: true,
    })
  }
  return cacheDirectory
}

export function createTailwindcssPatcher() {
  return new TailwindcssPatcher({
    cache: true,
  })
}
