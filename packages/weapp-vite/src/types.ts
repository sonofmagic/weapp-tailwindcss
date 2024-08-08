export interface PageDep {
  type: 'page'
  path: string
}

export interface ComponentDep {
  type: 'component'
  path: string
}

export interface Subpackage {
  pages: string[]
  root: string
  // 独立分包
  independent?: boolean
  // 入口文件，也要基于 root
  entry?: string
  name?: string
}

export interface SubpackageDep extends Subpackage {
  type: 'subPackage'
}

export type Dep = PageDep | ComponentDep | SubpackageDep

export interface Entry {
  type: 'page' | 'component' | 'app'
  path: string
  deps: Dep[]
}

export interface InlineConfig {
  srcRoot?: string
}
