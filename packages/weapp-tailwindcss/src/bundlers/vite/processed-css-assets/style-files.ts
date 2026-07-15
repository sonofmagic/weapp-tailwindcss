import { normalizeOutputPathKey } from '../../shared/module-graph'

const CSS_OUTPUT_FILE_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

export function isCssOutputFile(file: string) {
  return CSS_OUTPUT_FILE_RE.test(file)
}

export function isRootStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return isCssOutputFile(normalized) && !normalized.includes('/')
}

export function isMiniProgramStyleOutputFile(file: string) {
  return /\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(file)
}
