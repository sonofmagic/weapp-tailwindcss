import type { BundleSnapshot } from '../bundle-state'
import type { SourceCandidateFilterOptions } from '../source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { collectMiniProgramSubpackageSourceEntries, isSubpackageOutputFile } from './subpackages'

interface CreateSubpackageSourceCandidateScopeOptions {
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined
  getSourceCandidateSourcesForEntries?: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Map<string, Set<string>>) | undefined
  projectRoot?: string | undefined
  rootDir: string
  snapshot: BundleSnapshot
  sourceRoot?: string | undefined
  subpackageRoots?: Set<string> | undefined
  tailwindcssBasedir?: string | undefined
  useIncrementalMode: boolean
}

export function createSubpackageSourceCandidateScope(options: CreateSubpackageSourceCandidateScopeOptions) {
  const subpackageSourceExcludeEntries = options.subpackageRoots
    ? collectMiniProgramSubpackageSourceEntries(options.snapshot, options.subpackageRoots, [
        options.rootDir,
        options.tailwindcssBasedir,
        options.projectRoot,
      ])
    : []

  const isMainPackageStyleOutputFile = (file: string) =>
    options.subpackageRoots != null && !isSubpackageOutputFile(file, options.subpackageRoots)

  const resolveSubpackageOutputSourceEntries = (outputFile: string): TailwindSourceEntry[] | undefined => {
    if (!options.subpackageRoots) {
      return undefined
    }
    const matchedRoots = [...options.subpackageRoots].filter(root => isSubpackageOutputFile(outputFile, new Set([root])))
    if (matchedRoots.length !== 1) {
      return undefined
    }
    const root = matchedRoots[0]
    if (!root) {
      return undefined
    }
    return options.sourceRoot
      ? [{
          base: options.sourceRoot,
          negated: false,
          pattern: `${root}/**/*`,
        }]
      : [{
          base: options.rootDir,
          negated: false,
          pattern: `**/${root}/**/*`,
        }]
  }

  const shouldExcludeSubpackageSourceCandidates = (outputFile: string, cssHandlerOptions: { isMainChunk?: boolean | undefined }) =>
    cssHandlerOptions.isMainChunk === true
    && subpackageSourceExcludeEntries.length > 0
    && isMainPackageStyleOutputFile(outputFile)

  const createScopedSourceCandidateGetter = (
    outputFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) => {
    if (!options.getSourceCandidatesForEntries) {
      return undefined
    }
    const subpackageEntries = resolveSubpackageOutputSourceEntries(outputFile)
    if (subpackageEntries) {
      return (_entries: TailwindSourceEntry[] | undefined, filterOptions?: SourceCandidateFilterOptions) =>
        options.getSourceCandidatesForEntries?.(subpackageEntries, filterOptions) ?? new Set<string>()
    }
    if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
      return options.getSourceCandidatesForEntries
    }
    return (entries: TailwindSourceEntry[] | undefined, filterOptions?: SourceCandidateFilterOptions) =>
      options.getSourceCandidatesForEntries?.(entries, {
        ...filterOptions,
        excludeEntries: [
          ...(filterOptions?.excludeEntries ?? []),
          ...subpackageSourceExcludeEntries,
        ],
      }) ?? new Set<string>()
  }

  const createScopedSourceCandidateSourceGetter = (
    outputFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) => {
    if (!options.getSourceCandidateSourcesForEntries) {
      return undefined
    }
    const subpackageEntries = resolveSubpackageOutputSourceEntries(outputFile)
    if (subpackageEntries) {
      return (_entries: TailwindSourceEntry[] | undefined, filterOptions?: SourceCandidateFilterOptions) =>
        options.getSourceCandidateSourcesForEntries?.(subpackageEntries, filterOptions) ?? new Map<string, Set<string>>()
    }
    if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
      return options.getSourceCandidateSourcesForEntries
    }
    return (entries: TailwindSourceEntry[] | undefined, filterOptions?: SourceCandidateFilterOptions) =>
      options.getSourceCandidateSourcesForEntries?.(entries, {
        ...filterOptions,
        excludeEntries: [
          ...(filterOptions?.excludeEntries ?? []),
          ...subpackageSourceExcludeEntries,
        ],
      }) ?? new Map<string, Set<string>>()
  }

  const shouldInjectCssIntoMainFromOutput = (
    outputFile: string,
    _sourceFile: string,
    outputCssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) =>
    outputCssHandlerOptions.isMainChunk === true
    || (
      options.useIncrementalMode
      && isMainPackageStyleOutputFile(outputFile)
    )

  return {
    createScopedSourceCandidateGetter,
    createScopedSourceCandidateSourceGetter,
    shouldExcludeSubpackageSourceCandidates,
    shouldInjectCssIntoMainFromOutput,
  }
}
