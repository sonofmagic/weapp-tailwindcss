import type { DebugErrorContext, DebugManifest, DebugMetaEntry, DebugStage, DebugWriteType } from './types'
import fs from 'fs-extra'
import path from 'pathe'

type MetaStore = Map<string, Map<string, DebugMetaEntry>>

function createManifest(): DebugManifest {
  return {
    'pre': [],
    'normal': [],
    'post': [],
    'bundle-pre': [],
    'bundle-normal': [],
    'bundle-post': [],
  }
}

/**
 * 管理分阶段 `_meta.json` 与根级 `_manifest.json` 的聚合写入。
 */
export class DebugMetaWriter {
  private readonly stageMeta: MetaStore = new Map()

  constructor(
    private readonly cwd: string,
    private readonly targetDir: string,
    private readonly onError?: (error: unknown, context: DebugErrorContext) => void,
  ) {}

  async writeDebugFile(
    filePath: string,
    content: string | Uint8Array,
    context: { stage: DebugStage, type: DebugWriteType, id: string },
  ) {
    try {
      await fs.outputFile(filePath, content, 'utf8')
    }
    catch (error) {
      this.onError?.(error, context)
    }
  }

  pushMeta(metaFilePath: string, manifestKey: keyof DebugManifest, entry: DebugMetaEntry) {
    const list = this.stageMeta.get(metaFilePath) ?? new Map<string, DebugMetaEntry>()
    list.set(entry.file, entry)
    this.stageMeta.set(metaFilePath, list)

    const manifestFilePath = path.join(this.cwd, this.targetDir, '_manifest.json')
    const manifestEntries = this.stageMeta.get(manifestFilePath) ?? new Map<string, DebugMetaEntry>()
    manifestEntries.set(`${manifestKey}:${entry.file}`, entry)
    this.stageMeta.set(manifestFilePath, manifestEntries)
  }

  async flushMeta(metaFilePath: string, stage: DebugStage, manifestKey?: keyof DebugManifest) {
    const entries = [...(this.stageMeta.get(metaFilePath)?.values() ?? [])]
    if (entries.length === 0) {
      return
    }

    await this.writeDebugFile(
      metaFilePath,
      `${JSON.stringify(entries, null, 2)}\n`,
      { stage, type: 'bundle', id: '_meta.json' },
    )

    if (!manifestKey) {
      return
    }

    const manifest = createManifest()
    const manifestEntries = this.stageMeta.get(path.join(this.cwd, this.targetDir, '_manifest.json'))
    for (const [scopeKey, entry] of manifestEntries?.entries() ?? []) {
      const separatorIndex = scopeKey.indexOf(':')
      const scope = scopeKey.slice(0, separatorIndex) as keyof DebugManifest
      manifest[scope].push(entry)
    }

    await this.writeDebugFile(
      path.join(this.cwd, this.targetDir, '_manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { stage, type: 'bundle', id: '_manifest.json' },
    )
  }
}
