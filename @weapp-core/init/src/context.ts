import type { PackageJson, TSConfig } from 'pkg-types'
import type { ProjectConfig } from './types'

export function createContext() {
  return {
    projectConfig: {
      name: '',
      path: '',
      value: {} as ProjectConfig,
    },
    packageJson: {
      name: '',
      path: '',
      value: {} as PackageJson,
    },
    viteConfig: {
      name: '',
      path: '',
      value: '',
    },
    tsconfig: {
      name: '',
      path: '',
      value: {} as TSConfig,
    },
    tsconfigNode: {
      name: '',
      path: '',
      value: {} as TSConfig,
    },
    dts: {
      name: '',
      path: '',
      value: '',
    },
  }
}

export type Context = ReturnType<typeof createContext>
