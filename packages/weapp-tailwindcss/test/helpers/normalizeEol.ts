export function normalizeEol(str: string) {
  return String.prototype.replaceAll.call(str, '\r\n', () => '\n')
}
