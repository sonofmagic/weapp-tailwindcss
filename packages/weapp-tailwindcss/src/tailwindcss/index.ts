import type { PackageResolvingOptions } from 'local-pkg'
import type { PackageJson } from 'pkg-types'
import { getPackageInfoSync } from 'local-pkg'
import { createTailwindcssPatcher } from './patcher'

function getTailwindcssPackageInfo(options?: PackageResolvingOptions) {
  return getPackageInfoSync('tailwindcss', options) as {
    name: string
    version: string | undefined
    rootPath: string
    packageJsonPath: string
    packageJson: PackageJson
  } | undefined
}

export {
  createTailwindcssPatcher,
  getTailwindcssPackageInfo,
}
