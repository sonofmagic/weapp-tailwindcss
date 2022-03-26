import path from 'path'
import type { Compiler, Stats } from 'webpack'
export default (asset: string, compiler: Compiler, stats: Stats) => {
  const usedFs = compiler.outputFileSystem
  const outputPath = stats.compilation.outputOptions.path

  let data = ''
  let targetFile = asset

  const queryStringIdx = targetFile.indexOf('?')

  if (queryStringIdx >= 0) {
    targetFile = targetFile.substr(0, queryStringIdx)
  }

  try {
    // @ts-ignore
    data = usedFs.readFileSync(path.join(outputPath, targetFile)).toString()
  } catch (error) {
    data = (error as Error).toString()
  }

  return data
}
