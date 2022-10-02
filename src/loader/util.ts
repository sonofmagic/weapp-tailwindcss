import fs from 'fs'
import path from 'path'

export function mkfileSync (filename: string, content: string) {
  try {
    const dirname = path.dirname(filename)
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, {
        recursive: true
      })
    }
    fs.writeFileSync(filename, content, 'utf-8')
  } catch (error) {
    console.error(error)
  }
}
