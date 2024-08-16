import type { set } from '@weapp-core/shared'
// import type { Context } from './context'

export interface SetMethod {
  (path: set.InputType, value: any, options?: set.Options): void
}

export interface SharedUpdateOptions {
  root: string
  dest?: string
  write?: boolean
  cb?: (set: SetMethod) => void
  // ctx: Context
}

export interface UpdateProjectConfigOptions extends SharedUpdateOptions {

}

export interface UpdatePackageJsonOptions extends SharedUpdateOptions {
  command?: 'weapp-vite'
}

export interface ProjectConfig {
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
