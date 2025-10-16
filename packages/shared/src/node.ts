import crypto from 'node:crypto'
import path from 'pathe'

export function md5(input: crypto.BinaryLike) {
  return crypto.createHash('md5').update(input).digest('hex')
}

export function removeAllExtensions(filePath: string) {
  if (!filePath) {
    return ''
  }

  let baseName = path.basename(filePath)
  let ext = path.extname(baseName)

  while (ext) {
    baseName = baseName.slice(0, -ext.length)
    ext = path.extname(baseName)
  }

  const dir = path.dirname(filePath)
  return dir === '.' ? baseName : path.join(dir, baseName)
}
