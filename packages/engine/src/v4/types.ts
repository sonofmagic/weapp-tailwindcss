import type { Root } from 'postcss'
import type { TailwindStyleSource } from '../style-candidates.ts'

export interface TailwindV4SourceOptions {
  projectRoot?: string
  cwd?: string
  base?: string
  baseFallbacks?: string[]
  css?: string
  cssSources?: TailwindV4CssSource[]
  cssEntries?: string[]
  packageName?: string
}

export interface TailwindV4CssSource {
  css: string
  base?: string
  file?: string
  dependencies?: string[]
}

export interface TailwindV4ResolvedSource {
  projectRoot: string
  base: string
  baseFallbacks: string[]
  css: string
  dependencies: string[]
}

export interface TailwindV4CandidateSource {
  content: string
  extension?: string
}

export interface SourceEntry extends TailwindV4CandidateSource {
  id: string
}

export interface GenerationRequest {
  candidates?: Iterable<string>
  sourceEntries?: SourceEntry[]
  /**
   * 启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
   */
  bareArbitraryValues?: TailwindV4GenerateOptions['bareArbitraryValues']
}

export type GenerationChange
  = | { type: 'all' }
    | { type: 'candidates' }
    | { type: 'sourceEntries' }
    | { type: 'dependencies', paths?: Iterable<string> }
    | { type: 'source', source: TailwindV4ResolvedSource }

export type CssFragmentKind = 'tailwind' | 'theme' | 'preflight'

export interface CssFragment {
  id: string
  kind: CssFragmentKind
  root: Root
  sourceId: string
  order: number
}

export interface TailwindGenerationArtifact {
  fragments: CssFragment[]
  classSet: Set<string>
  rawCandidates: Set<string>
  dependencies: string[]
  sourceEntries: SourceEntry[]
}

export interface TailwindGenerationSession {
  readonly source: TailwindV4ResolvedSource
  generate: (request?: GenerationRequest) => Promise<TailwindGenerationArtifact>
  invalidate: (change: GenerationChange) => void
  dispose: () => void
}

export interface TailwindV4StyleSource extends TailwindStyleSource {}

export interface TailwindV4GenerateOptions {
  candidates?: Iterable<string>
  sources?: TailwindV4CandidateSource[]
  /**
   * 启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
   */
  bareArbitraryValues?: boolean | {
    units?: string[]
  }
  /**
   * 扫描文件系统 source entries 中的候选类名。
   *
   * - `true`：使用 Tailwind v4 编译入口解析出的 `@source` 列表。
   * - `TailwindV4SourcePattern[]`：使用调用方显式传入的 source 列表。
   */
  scanSources?: boolean | TailwindV4SourcePattern[]
}

export type TailwindV4CompiledSourceRoot = null | 'none' | {
  base: string
  pattern: string
}

export interface TailwindV4SourcePattern {
  base: string
  pattern: string
  negated: boolean
}

export interface TailwindV4GenerateResult {
  css: string
  classSet: Set<string>
  rawCandidates: Set<string>
  dependencies: string[]
  sources: TailwindV4SourcePattern[]
  root: TailwindV4CompiledSourceRoot
}

export interface TailwindV4StyleGenerateOptions extends TailwindV4SourceOptions {
  source?: TailwindV4ResolvedSource
  candidates?: Iterable<string>
  sources?: TailwindV4StyleSource[]
  /**
   * 启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
   */
  bareArbitraryValues?: TailwindV4GenerateOptions['bareArbitraryValues']
  /**
   * 除内存来源外，还扫描 Tailwind CSS v4 编译后解析的来源入口。
   */
  scanSources?: TailwindV4GenerateOptions['scanSources']
}

export interface TailwindV4StyleGenerateResult extends TailwindV4GenerateResult {
  tokens: Set<string>
  source: TailwindV4ResolvedSource
}

export interface TailwindV4DesignSystem {
  parseCandidate: (candidate: string) => unknown[]
  candidatesToCss: (candidates: string[]) => Array<string | null | undefined>
}

export interface TailwindV4Engine {
  source: TailwindV4ResolvedSource
  loadDesignSystem: () => Promise<TailwindV4DesignSystem>
  validateCandidates: (candidates: Iterable<string>) => Promise<Set<string>>
  generate: (options?: TailwindV4GenerateOptions) => Promise<TailwindV4GenerateResult>
}
