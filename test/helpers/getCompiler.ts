import webpack5 from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'
// import webpack4 from 'webpack4'

export const getCompiler5 = (options: webpack5.Configuration = {}) => {
  const compiler = webpack5(options)
  compiler.outputFileSystem = createFsFromVolume(new Volume())
  return compiler
}
