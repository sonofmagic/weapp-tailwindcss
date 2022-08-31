import webpack5 from 'webpack'
import { createFsFromVolume, Volume } from 'memfs'
import MemoryFS from 'memory-fs'
import webpack4 from 'webpack4'

export const getCompiler5 = (options: webpack5.Configuration = {}) => {
  const compiler = webpack5(options)
  compiler.outputFileSystem = createFsFromVolume(new Volume())
  return compiler
}

export const getCompiler4 = (options: webpack4.Configuration = {}) => {
  const fs = new MemoryFS()
  const compiler = webpack4(options)
  compiler.outputFileSystem = fs
  return compiler
}
