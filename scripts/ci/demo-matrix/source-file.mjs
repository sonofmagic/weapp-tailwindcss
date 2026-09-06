import { randomUUID } from 'node:crypto'
import { rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function replaceSourceFile(file, content) {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`)
  const mode = await stat(file).then(info => info.mode, (error) => {
    if (error.code !== 'ENOENT') {
      throw error
    }
  })
  try {
    // watcher 只能观察完整源码，不能读到 writeFile 截断后的中间状态。
    await writeFile(temporary, content, { flag: 'wx', mode })
    await rename(temporary, file)
  }
  finally {
    await rm(temporary, { force: true })
  }
}
