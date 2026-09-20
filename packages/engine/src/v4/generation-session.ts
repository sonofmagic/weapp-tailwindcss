import type { InternalGenerationRequest } from './generation-request.ts'
import type {
  GenerationChange,
  GenerationRequest,
  TailwindGenerationSession,
  TailwindV4DesignSystem,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4ResolvedSource,
} from './types.ts'
import {
  canonicalizeBareArbitraryValueCandidates,
  extractTailwindV4InlineSourceCandidates,
  replaceBareArbitraryValueSelectors,
  resolveValidTailwindV4Candidates,
} from './candidates.ts'
import { cloneTailwindGenerationArtifact, createTailwindGenerationArtifact } from './generation-artifact.ts'
import {
  collectRawCandidates,
  shouldCompileSourceEntries,
  stripCompiledSourceEntries,
  toGenerateOptions,
  toGenerationRequest,
} from './generation-request.ts'
import { compileTailwindV4Source, loadTailwindV4DesignSystem } from './node-adapter.ts'

interface TailwindGenerationRuntime {
  compiled: Awaited<ReturnType<typeof compileTailwindV4Source>>['compiled']
  dependencies: Set<string>
  designSystem: TailwindV4DesignSystem
  builtCandidates: Set<string>
}

interface InternalGenerationResult {
  css: string
  classSet: Set<string>
  rawCandidates: Set<string>
  dependencies: string[]
  sources: TailwindV4GenerateResult['sources']
  root: TailwindV4GenerateResult['root']
}

export interface TailwindV4EngineGenerationSession extends TailwindGenerationSession {
  loadDesignSystem: () => Promise<TailwindV4DesignSystem>
  validateCandidates: (candidates: Iterable<string>) => Promise<Set<string>>
  generateLegacy: (options?: TailwindV4GenerateOptions) => Promise<TailwindV4GenerateResult>
}

class TailwindGenerationSessionImpl implements TailwindV4EngineGenerationSession {
  private currentSource: TailwindV4ResolvedSource
  private readonly runtimes = new Map<boolean, Promise<TailwindGenerationRuntime>>()
  private designSystemPromise: Promise<TailwindV4DesignSystem> | undefined
  private disposed = false

  constructor(source: TailwindV4ResolvedSource) {
    this.currentSource = source
  }

  get source() {
    return this.currentSource
  }

  async generate(request: GenerationRequest = {}) {
    const generated = await this.generateInternal(request)
    return cloneTailwindGenerationArtifact(createTailwindGenerationArtifact(
      generated.css,
      this.currentSource,
      request,
      generated.classSet,
      generated.rawCandidates,
      generated.dependencies,
    ))
  }

  async generateLegacy(options?: TailwindV4GenerateOptions): Promise<TailwindV4GenerateResult> {
    const generated = await this.generateInternal(toGenerationRequest(options))
    return {
      css: generated.css,
      classSet: generated.classSet,
      rawCandidates: generated.rawCandidates,
      dependencies: generated.dependencies,
      sources: generated.sources,
      root: generated.root,
    }
  }

  loadDesignSystem() {
    this.assertActive()
    this.designSystemPromise ??= loadTailwindV4DesignSystem(this.currentSource, { cache: false })
    return this.designSystemPromise
  }

  async validateCandidates(candidates: Iterable<string>) {
    return resolveValidTailwindV4Candidates(await this.loadDesignSystem(), candidates)
  }

  invalidate(change: GenerationChange) {
    if (this.disposed) {
      return
    }
    if (change.type === 'source') {
      this.currentSource = change.source
    }
    this.runtimes.clear()
    this.designSystemPromise = undefined
  }

  dispose() {
    this.runtimes.clear()
    this.designSystemPromise = undefined
    this.disposed = true
  }

  private assertActive() {
    if (this.disposed) {
      throw new Error('Tailwind generation session has been disposed.')
    }
  }

  private getRuntime(compileSourceEntries: boolean) {
    this.assertActive()
    const cached = this.runtimes.get(compileSourceEntries)
    if (cached) {
      return cached
    }
    const source = compileSourceEntries
      ? this.currentSource
      : stripCompiledSourceEntries(this.currentSource)
    const promise = Promise.all([
      compileTailwindV4Source(source),
      loadTailwindV4DesignSystem(source, { cache: false }),
    ]).then(([compiledSource, designSystem]) => ({
      compiled: compiledSource.compiled,
      dependencies: compiledSource.dependencies,
      designSystem,
      builtCandidates: new Set<string>(),
    }))
    this.runtimes.set(compileSourceEntries, promise)
    promise.catch(() => {
      if (this.runtimes.get(compileSourceEntries) === promise) {
        this.runtimes.delete(compileSourceEntries)
      }
    })
    return promise
  }

  private async resetRuntime(compileSourceEntries: boolean) {
    this.runtimes.delete(compileSourceEntries)
    return this.getRuntime(compileSourceEntries)
  }

  private async generateInternal(request: InternalGenerationRequest): Promise<InternalGenerationResult> {
    this.assertActive()
    const options = toGenerateOptions(request)
    const compileSourceEntries = shouldCompileSourceEntries(options)
    let runtime = await this.getRuntime(compileSourceEntries)
    const rawCandidates = await collectRawCandidates(
      this.currentSource,
      options,
      runtime.compiled.root,
      runtime.compiled.sources,
    )
    const classSet = resolveValidTailwindV4Candidates(runtime.designSystem, rawCandidates, {
      ...(options.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: options.bareArbitraryValues }),
    })
    const inlineSources = extractTailwindV4InlineSourceCandidates(this.currentSource.css)
    for (const candidate of inlineSources.excluded) {
      classSet.delete(candidate)
    }

    const buildCandidates = new Set(canonicalizeBareArbitraryValueCandidates(classSet, options.bareArbitraryValues))
    if ([...runtime.builtCandidates].some(candidate => !buildCandidates.has(candidate))) {
      runtime = await this.resetRuntime(compileSourceEntries)
    }
    const css = replaceBareArbitraryValueSelectors(
      runtime.compiled.build([...buildCandidates]),
      classSet,
      options.bareArbitraryValues,
    )
    runtime.builtCandidates = new Set(buildCandidates)
    const dependencies = Array.from(runtime.dependencies)
    return {
      css,
      classSet,
      rawCandidates,
      dependencies,
      sources: runtime.compiled.sources,
      root: runtime.compiled.root,
    }
  }
}

export function createTailwindGenerationSession(
  source: TailwindV4ResolvedSource,
): TailwindGenerationSession {
  return new TailwindGenerationSessionImpl(source)
}

export function createTailwindV4EngineGenerationSession(
  source: TailwindV4ResolvedSource,
): TailwindV4EngineGenerationSession {
  return new TailwindGenerationSessionImpl(source)
}
