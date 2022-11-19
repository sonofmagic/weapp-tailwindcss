import path from 'path'
import fs from 'fs'
import { gte as semverGte } from 'semver'
import { parse, traverse, generate } from '@/babel'
import type { ArrayExpression, StringLiteral } from '@babel/types'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'
import { PackageJson } from 'pkg-types'
import { noop } from '@/utils'

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

export function findAstNode(content: string, options: ILengthUnitsPatchOptions) {
  const DOPTS = options.dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  const ast = parse(content)

  let arrayRef: ArrayExpression | undefined
  let changed = false
  traverse(ast, {
    Identifier(path) {
      if (path.node.name === DOPTS.variableName) {
        if (path.parent.type === 'VariableDeclarator') {
          if (path.parent.init?.type === 'ArrayExpression') {
            arrayRef = path.parent.init
            const set = new Set(path.parent.init.elements.map((x) => (<StringLiteral>x).value))
            for (let i = 0; i < options.units.length; i++) {
              const unit = options.units[i]
              if (!set.has(unit)) {
                path.parent.init.elements.push({
                  type: 'StringLiteral',
                  value: unit
                })
                changed = true
              }
            }
          }
        }
      }
    }
  })
  return {
    arrayRef,
    changed
  }
}

export function internalPatch(pkgJsonPath: string | undefined, options: ILengthUnitsPatchOptions) {
  const { dangerousOptions } = options
  const DOPTS = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  if (pkgJsonPath) {
    const rootDir = path.dirname(pkgJsonPath)

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
