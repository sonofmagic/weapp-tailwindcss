import type { set } from '@weapp-core/shared'

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
