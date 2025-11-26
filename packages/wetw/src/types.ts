export type WetwRegistryFile = {
  path: string
  content: string
} | {
  path: string
  src: string
}

export type WetwFramework = 'mp-weixin' | 'uni-app-vue3' | 'taro-react'

export type WetwRegistryFrameworkMap = Partial<Record<WetwFramework, WetwRegistryFile[]>>

export interface WetwRegistryItem {
  name: string
  description?: string
  /**
   * 默认文件列表（未区分框架时使用）
   */
  files?: WetwRegistryFile[]
  /**
   * 按框架划分的文件集合
   */
  frameworks?: WetwRegistryFrameworkMap
}

export interface WetwConfig {
  /**
   * Project root. Defaults to `process.cwd()`.
   */
  cwd?: string
  /**
   * Where generated files should live.
   */
  outDir?: string
  /**
   * Base folder for relative `src` entries in the registry.
   */
  templatesRoot?: string
  /**
   * Registry source. Can be:
   * - An array of registry items
   * - A local file path (json)
   * - A remote http(s) url returning registry json
   */
  registry?: string | WetwRegistryItem[]
  /**
   * 选定的框架类型，决定使用 registry 中的哪套模板。
   */
  framework?: WetwFramework
}

export interface ResolvedWetwConfig extends WetwConfig {
  cwd: string
  outDir: string
  templatesRoot: string
  registry: string | WetwRegistryItem[]
  framework: WetwFramework
}
