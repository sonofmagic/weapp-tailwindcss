import type { UserConfig as ViteUserConfig } from 'vite'
import type { WatchOptions as ChokidarWatchOptions } from 'chokidar'

export interface PageDep {
  type: 'page'
  path: string
}

export interface ComponentDep {
  type: 'component'
  path: string
}

export interface SubPackage {
  pages: string[]
  root: string
  // 独立分包
  independent?: boolean
  // 入口文件，也要基于 root
  entry?: string
  name?: string
}

export interface SubPackageDep extends SubPackage {
  type: 'subPackage'
}

export type Dep = PageDep | ComponentDep | SubPackageDep

export interface SubPackageEntry {
  type: 'subPackageEntry'
  path: string
  deps: Dep[]
}

export interface PageEntry {
  type: 'page'
  path: string
  deps: Dep[]
  jsonPath?: string
  json?: any
}

export interface ComponentEntry {
  type: 'component'
  path: string
  deps: Dep[]
  jsonPath: string
  json: any
}

export interface AppEntry {
  type: 'app'
  path: string
  deps: Dep[]
  jsonPath: string
  json: any
}

export type Entry = AppEntry | PageEntry | ComponentEntry | SubPackageEntry

export interface WatchOptions extends ChokidarWatchOptions {
  paths?: ReadonlyArray<string>
}
export interface WeappViteConfig {
  srcRoot?: string
  type?: 'app' | 'subPackage'
  subPackage?: Partial<SubPackage>
  watch?: WatchOptions
}

export type UserConfig = ViteUserConfig & { weapp?: WeappViteConfig }
