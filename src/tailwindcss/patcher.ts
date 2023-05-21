import path from 'path'
import fs from 'fs'
import { gte as semverGte } from 'semver'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions, InternalPatchResult } from '@/types'
import type { PackageJson } from 'pkg-types'
import { noop } from '@/utils'
import { pluginName } from '@/constants'
import { findAstNode } from './supportCustomUnit'
import { monkeyPatchForExposingContext, requireResolve, TailwindcssPatcher } from 'tailwindcss-patch'
import { generate } from '@/babel'

export function getInstalledPkgJsonPath(options: ILengthUnitsPatchOptions) {
  const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  try {
    // const cwd = process.cwd()
    const tmpJsonPath = requireResolve(`${dangerousOptions.packageName}/package.json`, {
      paths: options.paths,
      basedir: options.basedir
    })
    // `${cwd}/node_modules/${dangerousOptions.packageName}/package.json`
    // const pkgJson = require(tmpJsonPath) as PackageJson
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
    // https://github.com/tailwindlabs/tailwindcss/discussions/9675
    // if (semverGte(pkgJson.version!, dangerousOptions.gteVersion)) {
    return tmpJsonPath
    // }
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

export function internalPatch(pkgJsonPath: string | undefined, options: ILengthUnitsPatchOptions, overwrite: boolean = true): InternalPatchResult | undefined {
  if (pkgJsonPath) {
    const pkgJson = require(pkgJsonPath) as PackageJson
    const dangerousOptions = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
    if (semverGte(pkgJson.version!, dangerousOptions.gteVersion)) {
      const rootDir = path.dirname(pkgJsonPath)
      const dataTypes = monkeyPatchForSupportingCustomUnit(rootDir, options)
      const result = monkeyPatchForExposingContext(rootDir, {
        overwrite
      })
      return {
        ...result,
        dataTypes
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

export function createTailwindcssPatcher() {
  return new TailwindcssPatcher({
    cache: true
  })
}
