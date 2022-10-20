import readAsset from './readAsset'

import type { Compiler, Stats } from './types'
export default function readAssets(compiler: Compiler, stats: Stats) {
  const assets: Record<string, string> = {}

  Object.keys(stats.compilation.assets).forEach((asset) => {
    assets[asset] = readAsset(asset, compiler, stats)
  })

  return assets
}
