import type { RememberedCssSource } from './types'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { hasTailwindGenerationSource } from './sfc-style-source'

export interface TemporaryCssSourceEntry {
  file: string
  outputFile: string
  source: string
}

export function isTemporaryCssAssetFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return /\.css$/i.test(normalized) && !normalized.includes('/')
}

function normalizeCssSourceKey(file: string) {
  return normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
}

export function createTemporaryCssAssetSourceResolver(
  entries: TemporaryCssSourceEntry[],
) {
  const seenEntryFiles = new Set<string>()
  const queuedEntries = entries.filter((entry) => {
    const entryFile = normalizeCssSourceKey(entry.file)
    const outputFile = normalizeCssSourceKey(entry.outputFile)
    if (
      !hasTailwindGenerationSource(entry.source)
      || outputFile === entryFile
      || !outputFile.includes('/')
      || seenEntryFiles.has(entryFile)
    ) {
      return false
    }
    seenEntryFiles.add(entryFile)
    return true
  })
  const usedEntryFiles = new Set<string>()

  return {
    entries: queuedEntries,
    markUsed(sourceFile: string | undefined) {
      if (!sourceFile) {
        return
      }
      usedEntryFiles.add(normalizeCssSourceKey(sourceFile))
    },
    resolve(outputFile: string): RememberedCssSource | undefined {
      if (!isTemporaryCssAssetFile(outputFile)) {
        return
      }
      const entry = queuedEntries.find(item => !usedEntryFiles.has(normalizeCssSourceKey(item.file)))
      if (!entry) {
        return
      }
      usedEntryFiles.add(normalizeCssSourceKey(entry.file))
      return {
        outputFile: entry.outputFile,
        rawSource: entry.source,
        sourceFile: entry.file,
      }
    },
  }
}
