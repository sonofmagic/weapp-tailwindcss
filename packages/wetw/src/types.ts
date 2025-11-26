export type WetwRegistryFile
  = | {
    path: string
    content: string
  }
  | {
    path: string
    src: string
  }

export interface WetwRegistryItem {
  name: string
  description?: string
  files: WetwRegistryFile[]
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
}

export interface ResolvedWetwConfig extends WetwConfig {
  cwd: string
  outDir: string
  templatesRoot: string
  registry: string | WetwRegistryItem[]
}
