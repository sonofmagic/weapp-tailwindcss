import { mkdir } from 'node:fs/promises'
import path from 'node:path'

export async function watchRoots(watch, directories, options) {
  // Chokidar 3 对不存在的 glob 根重复递减就绪计数；先创建根，确保 ready 对应完整扫描。
  await Promise.all(directories.map(directory => mkdir(directory, { recursive: true })))
  // Gulp glob 使用正斜杠；只在进入 glob API 时转换文件系统路径。
  return watch(directories.map(directory => `${directory.split(path.sep).join('/')}/**/*`), options)
}
