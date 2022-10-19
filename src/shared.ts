import path from 'path'

export function getFileName(file: string) {
  return path.basename(file, path.extname(file))
}
