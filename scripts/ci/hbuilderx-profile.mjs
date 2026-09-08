import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** 为全新的 CI 用户目录预置首次界面状态，不覆盖现有 IDE 用户配置。 */
export async function prepareHBuilderXCIFirstRun(appData) {
  if (!appData) {
    throw new Error('Windows CI 缺少 APPDATA，无法初始化独立 HBuilderX 用户目录')
  }
  const directory = path.join(appData, 'HBuilder X')
  const file = path.join(directory, 'HBuilder X.ini')
  await mkdir(directory, { recursive: true })
  try {
    await writeFile(file, '[uistate]\nfirst=false\n', { flag: 'wx' })
    return { file, created: true }
  }
  catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
    const source = await readFile(file, 'utf8')
    let section = ''
    let first
    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        section = trimmed
      }
      else if (section === '[uistate]' && trimmed.startsWith('first=')) {
        first = trimmed.slice('first='.length)
      }
    }
    if (first !== 'false') {
      throw new Error(`HBuilderX 用户配置已存在且尚未完成首次界面初始化，不覆盖该文件：${file}`)
    }
    return { file, created: false }
  }
}
