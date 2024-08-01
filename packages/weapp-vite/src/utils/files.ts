export function removeExt(file: string) {
  return file.replace(/\.[^./]+$/, '')
}
