import { hasUserCssLayerBlocks } from '@/bundlers/shared/generator-css/user-css'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { normalizeVitePersistentCacheKey } from '../plugin-cache'
import { cleanUrl } from '../utils'

const WEB_HMR_RUNTIME_AFFECTING_DIRECTIVE_RE = /@(?:theme|source|config|plugin|apply)\b/

interface CandidateDelta {
  addedCandidates: Set<string>
  removedCandidates: Set<string>
}

export interface ViteSourceCandidateChange extends CandidateDelta {
  file: string
  runtimeAffecting: boolean
}

interface ViteHmrModule {
  file?: string | null
  id?: string | null
  url?: string | null
}

interface ViteHmrGeneratorOptions {
  hmr: {
    preserveDeletedCss: boolean
  }
  target: string
}

interface CreateViteHmrCandidateStateOptions {
  cleanGeneratedCssByFile: Map<string, string>
  generatedClassSetByFile: Map<string, Set<string>>
  getCommand: () => string | undefined
  getGeneratorOptions: () => ViteHmrGeneratorOptions
  getSourceCandidate: (file: string) => string | undefined
}

export function createViteHmrCandidateState(options: CreateViteHmrCandidateStateOptions) {
  let pendingChange: ViteSourceCandidateChange | undefined
  let pendingCssTargetFiles: Set<string> | undefined
  let pendingFullRegeneration = false

  const normalizeCssTargetFile = (file: string) => normalizeVitePersistentCacheKey(cleanUrl(file))

  const clear = () => {
    pendingChange = undefined
    pendingCssTargetFiles = undefined
    pendingFullRegeneration = false
  }

  const queueFullRegeneration = () => {
    pendingChange = undefined
    pendingCssTargetFiles = undefined
    pendingFullRegeneration = true
  }

  const queueChange = (change: ViteSourceCandidateChange) => {
    pendingFullRegeneration = false
    if (!pendingChange) {
      pendingChange = {
        file: change.file,
        runtimeAffecting: change.runtimeAffecting,
        addedCandidates: new Set(change.addedCandidates),
        removedCandidates: new Set(change.removedCandidates),
      }
      return
    }
    for (const candidate of change.addedCandidates) {
      pendingChange.addedCandidates.add(candidate)
      pendingChange.removedCandidates.delete(candidate)
    }
    for (const candidate of change.removedCandidates) {
      if (!pendingChange.addedCandidates.delete(candidate)) {
        pendingChange.removedCandidates.add(candidate)
      }
    }
    pendingChange.runtimeAffecting ||= change.runtimeAffecting
    pendingChange.file = change.file
  }

  const createChange = (file: string, change: CandidateDelta, changeOptions: { runtimeAffecting?: boolean } = {}): ViteSourceCandidateChange => ({
    ...change,
    file,
    runtimeAffecting: changeOptions.runtimeAffecting === true
      || isSourceStyleRequest(file)
      || WEB_HMR_RUNTIME_AFFECTING_DIRECTIVE_RE.test(options.getSourceCandidate(file) ?? ''),
  })

  const apply = (change: ViteSourceCandidateChange) => {
    if (isSourceStyleRequest(change.file)) {
      clear()
      return change
    }
    const preserveDeletedCss = options.getGeneratorOptions().hmr.preserveDeletedCss
    if (preserveDeletedCss && !change.runtimeAffecting) {
      if (change.addedCandidates.size > 0) {
        queueChange(change)
      }
      else if (!pendingChange) {
        clear()
      }
      return change
    }
    clear()
    if (!preserveDeletedCss) {
      queueFullRegeneration()
    }
    return change
  }

  const resolve = (generatorCode: string, file: string) => {
    const fileKey = normalizeCssTargetFile(file)
    if (
      options.getCommand() !== 'serve'
      || !pendingChange
      || pendingChange.runtimeAffecting
      || pendingChange.addedCandidates.size === 0
      || (options.getGeneratorOptions().target === 'weapp' && hasUserCssLayerBlocks(generatorCode))
      || !options.cleanGeneratedCssByFile.has(fileKey)
      || !options.generatedClassSetByFile.has(fileKey)
      || (pendingCssTargetFiles !== undefined && !pendingCssTargetFiles.has(fileKey))
    ) {
      return undefined
    }
    return pendingChange
  }

  const finishTarget = (file: string) => {
    if (!pendingChange) {
      return
    }
    if (!pendingCssTargetFiles) {
      clear()
      return
    }
    pendingCssTargetFiles.delete(normalizeCssTargetFile(file))
    if (pendingCssTargetFiles.size === 0) {
      clear()
    }
  }

  const armTargets = (cssModules: ViteHmrModule[], fallbackCssIds: Iterable<string>) => {
    if (!pendingChange) {
      pendingCssTargetFiles = undefined
      return
    }
    const targets = new Set<string>()
    const addTarget = (file?: string | null) => {
      if (!file) {
        return
      }
      const key = normalizeCssTargetFile(file)
      if (options.cleanGeneratedCssByFile.has(key)) {
        targets.add(key)
      }
    }
    for (const module of cssModules) {
      addTarget(module.id)
      addTarget(module.file)
      addTarget(module.url)
    }
    for (const id of fallbackCssIds) {
      addTarget(id)
    }
    pendingCssTargetFiles = targets.size > 0 ? targets : undefined
  }

  return {
    apply,
    armTargets,
    clear,
    createChange,
    finishTarget,
    hasPendingCandidateAppend: () => pendingChange != null && !pendingChange.runtimeAffecting && pendingChange.addedCandidates.size > 0,
    hasPendingChange: () => pendingChange != null,
    queueFullRegeneration,
    resolve,
    shouldForceFullRegeneration: (resolved: boolean) => pendingFullRegeneration || (options.getCommand() === 'serve' && pendingChange != null && !resolved),
    snapshotDebugState: () => ({
      pendingAddedCandidates: pendingChange?.addedCandidates.size ?? 0,
      pendingCssTargets: pendingCssTargetFiles?.size ?? 0,
    }),
  }
}
