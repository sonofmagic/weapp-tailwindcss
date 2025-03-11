import crypto from 'node:crypto'

export function md5Hash(data: crypto.BinaryLike) {
  return crypto.createHash('md5').update(data).digest('hex')
}
