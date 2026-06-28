import type { RememberedCssSource } from './types'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { hasTailwindGenerationSource } from './sfc-style-source'
import { scoreConfiguredTailwindV4SourceForRawSource } from './tailwind-v4-css-source'

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
      outputFile === entryFile
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
    resolve(outputFile: string, rawSource?: string): RememberedCssSource | undefined {
      if (!isTemporaryCssAssetFile(outputFile)) {
        return
      }
      const availableEntries = queuedEntries.filter(item => !usedEntryFiles.has(normalizeCssSourceKey(item.file)))
      const scoredEntries = rawSource
        ? availableEntries
            .map(entry => ({
              entry,
              score: scoreConfiguredTailwindV4SourceForRawSource(rawSource, entry.source),
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
        : []
      const bestScore = scoredEntries[0]?.score
      const bestEntries = bestScore
        ? scoredEntries.filter(item => item.score === bestScore)
        : []
      const entry = bestEntries.length === 1
        ? bestEntries[0]?.entry
        : availableEntries.find(item => hasTailwindGenerationSource(item.source))
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
