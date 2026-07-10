import type { WatchArtifactEntry, WatchArtifactSnapshot, WatchCaseArtifacts } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import path from 'node:path'
import {
  collectCssImportRequestsRoot,
  isLocalCssImportRequest,
  isPureLocalCssImportWrapper,
  postcss,
} from '../packages/postcss/src/index'
import { diffWatchArtifactSnapshots } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/artifacts'

const SHA256_RE = /^[a-f0-9]{64}$/

function fail(label: string, message: string): never {
  throw new Error(`[${label}] dev/HMR artifact snapshot gate: ${message}`)
}

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

function assertSnapshotEntry(label: string, phase: WatchArtifactSnapshot['phase'], entry: WatchArtifactEntry) {
  if (!entry.file || path.isAbsolute(entry.file)) {
    fail(label, `${phase} snapshot has an invalid relative file: ${entry.file}`)
  }
  if (!entry.exists) {
    if (entry.size !== 0 || entry.sha256 != null || entry.content != null) {
      fail(label, `${phase} snapshot missing file carries content metadata: ${entry.file}`)
    }
    return
  }
  if (!entry.sha256 || !SHA256_RE.test(entry.sha256)) {
    fail(label, `${phase} snapshot file has no valid sha256: ${entry.file}`)
  }
  if (entry.size < 0) {
    fail(label, `${phase} snapshot file has an invalid size: ${entry.file}`)
  }
  if (entry.content != null) {
    if (Buffer.byteLength(entry.content) !== entry.size) {
      fail(label, `${phase} snapshot content size mismatch: ${entry.file}`)
    }
    if (sha256(entry.content) !== entry.sha256) {
      fail(label, `${phase} snapshot content hash mismatch: ${entry.file}`)
    }
  }
}

function snapshotByFile(label: string, snapshot: WatchArtifactSnapshot) {
  const entries = new Map<string, WatchArtifactEntry>()
  for (const entry of snapshot.files) {
    assertSnapshotEntry(label, snapshot.phase, entry)
    if (entries.has(entry.file)) {
      fail(label, `${snapshot.phase} snapshot contains duplicate file: ${entry.file}`)
    }
    entries.set(entry.file, entry)
  }
  if (entries.size === 0) {
    fail(label, `${snapshot.phase} snapshot contains no output files`)
  }
  return entries
}

function resolveImportTargets(file: string, css: string) {
  const root = postcss.parse(css)
  const baseDir = path.posix.dirname(file)
  return [...collectCssImportRequestsRoot(root)]
    .filter(isLocalCssImportRequest)
    .map(request => request.replace(/[?#].*$/, ''))
    .map(request => path.posix.normalize(path.posix.join(baseDir === '.' ? '' : baseDir, request)))
    .sort()
}

function assertImportShellSnapshots(
  label: string,
  devByFile: ReadonlyMap<string, WatchArtifactEntry>,
  hmrByFile: ReadonlyMap<string, WatchArtifactEntry>,
) {
  for (const [file, devEntry] of devByFile) {
    if (devEntry.content == null || !isPureLocalCssImportWrapper(devEntry.content)) {
      continue
    }
    const hmrEntry = hmrByFile.get(file)
    if (!hmrEntry?.exists || hmrEntry.content == null || !isPureLocalCssImportWrapper(hmrEntry.content)) {
      fail(label, `HMR replaced local import shell output: ${file}`)
    }
    const devTargets = resolveImportTargets(file, devEntry.content)
    const hmrTargets = resolveImportTargets(file, hmrEntry.content)
    if (JSON.stringify(hmrTargets) !== JSON.stringify(devTargets)) {
      fail(label, `HMR changed local import shell targets: ${file}`)
    }
    for (const target of devTargets) {
      const devTarget = devByFile.get(target)
      const hmrTarget = hmrByFile.get(target)
      if (!devTarget?.exists || devTarget.size === 0) {
        fail(label, `dev import shell target is missing or empty: ${file} -> ${target}`)
      }
      if (!hmrTarget?.exists || hmrTarget.size === 0) {
        fail(label, `HMR import shell target is missing or empty: ${file} -> ${target}`)
      }
    }
  }
}

export function assertDevHmrArtifactSnapshotGate(label: string, artifacts: WatchCaseArtifacts | undefined) {
  if (!artifacts) {
    fail(label, 'report is missing artifacts.dev and artifacts.hmr')
  }
  if (artifacts.requestedHmrCount < 1 || artifacts.capturedAfterHmrCount < artifacts.requestedHmrCount) {
    fail(label, `HMR snapshot was captured too early: ${artifacts.capturedAfterHmrCount}/${artifacts.requestedHmrCount}`)
  }
  if (artifacts.dev.phase !== 'dev' || artifacts.hmr.phase !== 'hmr') {
    fail(label, `snapshot phases are invalid: ${artifacts.dev.phase}/${artifacts.hmr.phase}`)
  }
  const devByFile = snapshotByFile(label, artifacts.dev)
  const hmrByFile = snapshotByFile(label, artifacts.hmr)
  assertImportShellSnapshots(label, devByFile, hmrByFile)

  const recomputed = diffWatchArtifactSnapshots(
    artifacts.dev,
    artifacts.hmr,
    artifacts.requestedHmrCount,
    artifacts.capturedAfterHmrCount,
  )
  if (
    artifacts.diff.from !== 'dev'
    || artifacts.diff.to !== 'hmr'
    || artifacts.diff.requestedHmrCount !== artifacts.requestedHmrCount
    || artifacts.diff.capturedAfterHmrCount !== artifacts.capturedAfterHmrCount
    || artifacts.diff.changedFileCount !== recomputed.changedFileCount
    || JSON.stringify(artifacts.diff.files) !== JSON.stringify(recomputed.files)
    || artifacts.diff.text !== recomputed.text
  ) {
    fail(label, 'dev/HMR artifact diff does not match the captured snapshots')
  }
}
