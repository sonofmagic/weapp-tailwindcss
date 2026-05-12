import type { WatchCase } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import fs from 'node:fs/promises'
import { expandOutputFileEntries } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations'
import { readFileIfExists } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'

export type ArtifactKind = 'wxml' | 'js' | 'style'

export interface ArtifactSnapshot {
  kind: ArtifactKind
  file: string
  content: string
}

export async function readArtifacts(watchCase: WatchCase): Promise<ArtifactSnapshot[]> {
  const styleFiles = await expandOutputFileEntries([
    ...watchCase.outputStyleCandidates,
    ...watchCase.globalStyleCandidates,
  ])
  const files: Array<{ kind: ArtifactKind, file: string }> = [
    { kind: 'wxml', file: watchCase.outputWxml },
    { kind: 'js', file: watchCase.outputJs },
    ...styleFiles.map(file => ({ kind: 'style' as const, file })),
  ]
  const snapshots: ArtifactSnapshot[] = []

  for (const item of files) {
    const content = await readFileIfExists(item.file)
    if (content != null) {
      snapshots.push({
        ...item,
        content,
      })
    }
  }
  return snapshots
}

export async function collectArtifactMtimes(watchCase: WatchCase) {
  const artifacts = await readArtifacts(watchCase)
  const mtimes = new Map<string, number>()

  for (const item of artifacts) {
    const stat = await fs.stat(item.file).catch(() => undefined)
    mtimes.set(item.file, stat?.mtimeMs ?? 0)
  }

  return { artifacts, mtimes }
}

export function joinArtifactContent(artifacts: ArtifactSnapshot[], kind: ArtifactKind) {
  return artifacts.filter(item => item.kind === kind).map(item => item.content).join('\n')
}

export function countChangedArtifacts(before: ArtifactSnapshot[], after: ArtifactSnapshot[]) {
  const beforeByFile = new Map(before.map(item => [item.file, item.content]))
  let changed = 0

  for (const item of after) {
    if (beforeByFile.get(item.file) !== item.content) {
      changed += 1
    }
  }
  return changed
}

export function hasAnyNeedle(artifacts: ArtifactSnapshot[], needles: string[]) {
  return artifacts.some(artifact => needles.some(needle => artifact.content.includes(needle)))
}

export function summarizeChangedArtifacts(before: ArtifactSnapshot[], after: ArtifactSnapshot[]) {
  const beforeByFile = new Map(before.map(item => [item.file, item.content]))
  return after
    .filter(item => beforeByFile.get(item.file) !== item.content)
    .map(item => `${item.kind}:${item.file}`)
}
