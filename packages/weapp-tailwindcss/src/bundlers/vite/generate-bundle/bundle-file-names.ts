import type { OutputAsset, OutputChunk } from 'rollup'

export function normalizeBundleFileNameKeysForTest(bundle: Record<string, OutputAsset | OutputChunk>) {
  for (const [file, output] of Object.entries(bundle)) {
    if (!output.fileName || output.fileName === file) {
      continue
    }
    const existing = bundle[output.fileName]
    if (existing != null && existing !== output) {
      continue
    }
    bundle[output.fileName] = output
    delete bundle[file]
  }
}
