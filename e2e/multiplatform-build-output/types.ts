export type BuildOutputCaseStatus = 'ci' | 'local'

export type MultiplatformFramework = 'uni-app' | 'uni-app-x' | 'taro' | 'mpx' | 'gulp'

export interface BuildOutputCase {
  name: string
  framework: MultiplatformFramework
  projectDir: string
  platform: string
  command: string[]
  commandCwd?: 'project' | 'repo'
  outputDir: string
  requiredFiles: string[]
  styleFiles: string[]
  styleFileExtensions?: string[]
  textFiles?: string[]
  styleContains: Array<string | RegExp>
  forbidEmptyBlockAtRules?: boolean
  textContains?: Array<string | RegExp>
  fileAssertions?: Array<{
    file: string
    contains?: Array<string | RegExp>
    notContains?: Array<string | RegExp>
  }>
  notContains?: Array<string | RegExp>
  env?: Record<string, string>
  verifySourceFixtures?: boolean
  status: BuildOutputCaseStatus
  reason?: string
}

export interface MultiplatformTarget {
  framework: MultiplatformFramework
  projectDir: string
  platform: string
  coverage: 'default-ci' | 'ci-script' | 'local'
  reason?: string
}
