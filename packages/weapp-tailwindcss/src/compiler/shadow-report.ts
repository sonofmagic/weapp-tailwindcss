import type {
  ArtifactSemanticDifference,
  ArtifactSemanticSummary,
  CompareArtifactSemanticsOptions,
} from './semantic-css'
import type { GenerationArtifact } from './types'
import { compareArtifactSemantics } from './semantic-css'

export interface CompilerShadowReport {
  file: string
  scopeId: string
  equal: boolean
  differences: ArtifactSemanticDifference[]
  truncated: boolean
  legacy: ArtifactSemanticSummary
  graph: ArtifactSemanticSummary
}

export interface CreateCompilerShadowReportOptions extends CompareArtifactSemanticsOptions {
  scopeId?: string | undefined
}

export function createCompilerShadowReport(
  file: string,
  legacy: GenerationArtifact | undefined,
  graph: GenerationArtifact | undefined,
  options: CreateCompilerShadowReportOptions = {},
): CompilerShadowReport {
  const comparison = compareArtifactSemantics(legacy, graph, options)
  return {
    file,
    scopeId: options.scopeId ?? file,
    equal: comparison.equal,
    differences: comparison.differences,
    truncated: comparison.truncated,
    legacy: comparison.left,
    graph: comparison.right,
  }
}
