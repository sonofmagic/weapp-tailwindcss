import type { OutputAsset, OutputChunk } from 'rollup'
import { AsyncLocalStorage } from 'node:async_hooks'
import { normalizeOutputPathKey } from '../shared/module-graph'

export interface ViteSourceOutputRemovalConsumer {
  consume: (currentBundleFiles: Iterable<string>) => string[]
}

export interface ViteSourceOutputRelationOwner {
  createRemovalConsumer: () => ViteSourceOutputRemovalConsumer
  dispose: () => void
  observeSource: (sourceFile: string) => void
  recordBundle: (bundle: Record<string, OutputAsset | OutputChunk>) => void
  recordOwnedOutput: (sourceFile: string, outputFile: string) => void
  removeSource: (sourceFile: string) => Set<string>
}

const activeRelationOwnerStorage = new AsyncLocalStorage<ViteSourceOutputRelationOwner>()

function normalizeSourceFile(sourceFile: string) {
  return normalizeOutputPathKey(sourceFile.replace(/[?#].*$/, ''))
}

function normalizeOutputFile(outputFile: string) {
  return normalizeOutputPathKey(outputFile)
}

function collectOwnedSources(output: OutputAsset | OutputChunk) {
  if (output.type === 'chunk') {
    if (output.facadeModuleId) {
      return [output.facadeModuleId]
    }
    const moduleIds = Array.isArray(output.moduleIds) ? output.moduleIds : []
    return moduleIds.length === 1 ? moduleIds : []
  }
  return [
    output.originalFileName,
    ...(Array.isArray(output.originalFileNames) ? output.originalFileNames : []),
  ].filter((sourceFile): sourceFile is string => typeof sourceFile === 'string' && sourceFile.length > 0)
}

export function createViteSourceOutputRelationOwner(): ViteSourceOutputRelationOwner {
  const outputsBySource = new Map<string, Set<string>>()
  const sourcesByOutput = new Map<string, Set<string>>()
  const deletedSources = new Set<string>()
  const consumers = new Set<{ pending: Set<string> }>()
  let disposed = false

  const unlinkSourceFromOutput = (sourceFile: string, outputFile: string) => {
    const outputs = outputsBySource.get(sourceFile)
    outputs?.delete(outputFile)
    if (outputs?.size === 0) {
      outputsBySource.delete(sourceFile)
    }
    const sources = sourcesByOutput.get(outputFile)
    sources?.delete(sourceFile)
    if (sources?.size === 0) {
      sourcesByOutput.delete(outputFile)
    }
  }

  const recordOwnedOutput = (sourceFile: string, outputFile: string) => {
    if (disposed) {
      return
    }
    const sourceKey = normalizeSourceFile(sourceFile)
    const outputKey = normalizeOutputFile(outputFile)
    if (!sourceKey || !outputKey || deletedSources.has(sourceKey)) {
      return
    }
    const outputs = outputsBySource.get(sourceKey) ?? new Set<string>()
    outputs.add(outputKey)
    outputsBySource.set(sourceKey, outputs)
    const sources = sourcesByOutput.get(outputKey) ?? new Set<string>()
    sources.add(sourceKey)
    sourcesByOutput.set(outputKey, sources)
  }

  const replaceOutputOwners = (outputFile: string, sourceFiles: string[]) => {
    const outputKey = normalizeOutputFile(outputFile)
    for (const sourceFile of [...(sourcesByOutput.get(outputKey) ?? [])]) {
      unlinkSourceFromOutput(sourceFile, outputKey)
    }
    for (const sourceFile of sourceFiles) {
      deletedSources.delete(normalizeSourceFile(sourceFile))
      recordOwnedOutput(sourceFile, outputKey)
    }
  }

  return {
    createRemovalConsumer() {
      const state = { pending: new Set<string>() }
      consumers.add(state)
      return {
        consume(currentBundleFiles) {
          if (disposed || state.pending.size === 0) {
            return []
          }
          const currentFiles = new Set([...currentBundleFiles].map(normalizeOutputFile))
          const removedFiles = [...state.pending].filter(file => !currentFiles.has(file))
          state.pending.clear()
          return removedFiles
        },
      }
    },
    dispose() {
      disposed = true
      outputsBySource.clear()
      sourcesByOutput.clear()
      deletedSources.clear()
      consumers.clear()
    },
    observeSource(sourceFile) {
      if (!disposed) {
        deletedSources.delete(normalizeSourceFile(sourceFile))
      }
    },
    recordBundle(bundle) {
      if (disposed) {
        return
      }
      for (const [bundleFile, output] of Object.entries(bundle)) {
        const ownedSources = collectOwnedSources(output)
        if (ownedSources.length > 0) {
          replaceOutputOwners(output.fileName || bundleFile, ownedSources)
        }
      }
    },
    recordOwnedOutput,
    removeSource(sourceFile) {
      if (disposed) {
        return new Set()
      }
      const sourceKey = normalizeSourceFile(sourceFile)
      deletedSources.add(sourceKey)
      const removedOutputs = new Set<string>()
      for (const outputFile of [...(outputsBySource.get(sourceKey) ?? [])]) {
        unlinkSourceFromOutput(sourceKey, outputFile)
        if (!sourcesByOutput.has(outputFile)) {
          removedOutputs.add(outputFile)
          for (const consumer of consumers) {
            consumer.pending.add(outputFile)
          }
        }
      }
      return removedOutputs
    },
  }
}

export function getActiveViteSourceOutputRelationOwner() {
  return activeRelationOwnerStorage.getStore()
}

export function withViteSourceOutputRelationOwner<T>(
  owner: ViteSourceOutputRelationOwner,
  run: () => T,
): T {
  return activeRelationOwnerStorage.run(owner, run)
}
