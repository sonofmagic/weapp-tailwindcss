import path from 'path'
import fs from 'fs'
import { gte as semverGte } from 'semver'
import { parse, traverse, generate } from '@/babel'
import type { ArrayExpression, StringLiteral } from '@babel/types'
import type { ILengthUnitsPatchOptions, ILengthUnitsPatchDangerousOptions } from '@/types'
import { PackageJson } from 'pkg-types'
import { noop } from '@/utils'
export function internalPatch(options: ILengthUnitsPatchOptions) {
  const { units, paths, dangerousOptions } = options
  const DOptions = dangerousOptions as Required<ILengthUnitsPatchDangerousOptions>
  let pkgJsonPath: string | undefined
  try {
    const tmpJsonPath = require.resolve(`${DOptions.packageName}/package.json`, {
      paths
    })
    const pkgJson = JSON.parse(tmpJsonPath) as PackageJson
    // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110
    // https://github.com/tailwindlabs/tailwindcss/discussions/9675
    if (semverGte(pkgJson.version!, DOptions.gteVersion)) {
      pkgJsonPath = tmpJsonPath
    }
  } catch (error) {
    if ((<Error & { code: string }>error).code === 'MODULE_NOT_FOUND') {
      console.warn('没有找到`tailwindcss`包，请确认是否安装。想要禁用打上rpx支持patch或者非`tailwindcss`框架，你可以设置 `supportCustomLengthUnitsPatch` 为 false')
    }
  }
  if (pkgJsonPath) {
    const rootDir = path.dirname(pkgJsonPath)

    const dataTypesFilePath = path.resolve(rootDir, DOptions.lengthUnitsFilePath)
    const dataTypesFileContent = fs.readFileSync(dataTypesFilePath, {
      encoding: 'utf-8'
    })
    const ast = parse(dataTypesFileContent)

    let arrayRef: ArrayExpression | undefined
    let fileNeedToRegen = false
    traverse(ast, {
      Identifier(path) {
        if (path.node.name === DOptions.variableName) {
          if (path.parent.type === 'VariableDeclarator') {
            if (path.parent.init?.type === 'ArrayExpression') {
              arrayRef = path.parent.init
              const set = new Set(path.parent.init.elements.map((x) => (<StringLiteral>x).value))
              for (let i = 0; i < units.length; i++) {
                const unit = units[i]
                if (!set.has(unit)) {
                  path.parent.init.elements.push({
                    type: 'StringLiteral',
                    value: unit
                  })
                  fileNeedToRegen = true
                }
              }
            }
          }
        }
      }
    })
    if (arrayRef && fileNeedToRegen) {
      // @ts-ignore
      const { code } = generate(arrayRef)
      if (arrayRef.start && arrayRef.end) {
        const prev = dataTypesFileContent.slice(0, arrayRef.start)
        const next = dataTypesFileContent.slice(arrayRef.end as number)

        fs.writeFileSync(dataTypesFilePath, prev + code + next, {
          encoding: 'utf-8'
        })
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
      return internalPatch(options)
    } catch (error) {
      console.warn(`patch tailwindcss failed:` + (<Error>error).message)
    }
  }
}
