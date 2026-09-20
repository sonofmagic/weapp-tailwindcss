import { expect } from 'vitest'
import { sourceFilesContract } from '../../../test-helper/src/source-files-contract'
import { expandTailwindSourceEntries } from '@/tailwindcss/source-scan'
import { sourceScanContract } from '../../../test-helper/src/source-scan-contract'
import { createViteSourceScanMatcher } from '@/bundlers/vite/source-scan'
import { resolveTailwindSourceEntry } from '@/tailwindcss/source-scan'
sourceScanContract('Vite 扫描适配器', {
  matches: (file, entries) => createViteSourceScanMatcher(entries)?.(file),
  resolveEntry: resolveTailwindSourceEntry,
}, expect)
sourceFilesContract('Vite 扫描适配器', async (entries) => {
  const matcher = createViteSourceScanMatcher(entries)
  return (await expandTailwindSourceEntries(entries)).filter(file => matcher?.(file))
}, expect)
