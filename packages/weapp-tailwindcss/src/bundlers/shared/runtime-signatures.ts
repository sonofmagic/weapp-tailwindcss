import type { RuntimeEntryType } from '@/compiler'

export function summarizeStringDiff(previous: string, next: string) {
  if (previous === next) {
    return 'same'
  }

  const previousLength = previous.length
  const nextLength = next.length
  const minLength = Math.min(previousLength, nextLength)
  let prefixLength = 0
  while (prefixLength < minLength && previous.charCodeAt(prefixLength) === next.charCodeAt(prefixLength)) {
    prefixLength += 1
  }

  let previousSuffixCursor = previousLength - 1
  let nextSuffixCursor = nextLength - 1
  while (
    previousSuffixCursor >= prefixLength
    && nextSuffixCursor >= prefixLength
    && previous.charCodeAt(previousSuffixCursor) === next.charCodeAt(nextSuffixCursor)
  ) {
    previousSuffixCursor -= 1
    nextSuffixCursor -= 1
  }

  const previousChangedLength = previousSuffixCursor >= prefixLength ? previousSuffixCursor - prefixLength + 1 : 0
  const nextChangedLength = nextSuffixCursor >= prefixLength ? nextSuffixCursor - prefixLength + 1 : 0

  return `changed@${prefixLength} old=${previousChangedLength} new=${nextChangedLength} len=${previousLength}->${nextLength}`
}

export function createLinkedImpactSignature(
  entry: string,
  linkedImpactsByEntry: Map<string, Set<string>>,
  sourceHashByFile: Map<string, string>,
) {
  const changedLinkedFiles = linkedImpactsByEntry.get(entry)
  if (!changedLinkedFiles || changedLinkedFiles.size === 0) {
    return undefined
  }

  const parts = [...changedLinkedFiles]
    .sort()
    .map((file) => {
      const hash = sourceHashByFile.get(file) ?? 'missing'
      return `${file}:${hash}`
    })

  return parts.join(',')
}

export function createJsHashSalt(runtimeSignature: string, linkedImpactSignature?: string) {
  if (!linkedImpactSignature) {
    return runtimeSignature
  }
  return `${runtimeSignature}:linked:${linkedImpactSignature}`
}

export function createStableTextSignature(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function createCandidateSignature(candidates: Set<string>) {
  if (candidates.size === 0) {
    return 'empty'
  }
  return createStableTextSignature([...candidates].sort().join('\n'))
}

export function getSnapshotHash(snapshotMap: Map<string, string>, file: string, fallback: string) {
  return snapshotMap.get(file) ?? fallback
}

export function hasRuntimeAffectingSourceChanges(changedByType: Record<RuntimeEntryType, Set<string>>) {
  return changedByType.html.size > 0 || changedByType.js.size > 0
}
