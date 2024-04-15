import chokidar from 'chokidar'
import { createContext } from 'weapp-tailwindcss/core'

export function createWatcher() {
  const { transformJs, transformWxml, transformWxss } = createContext()
  return chokidar.watch('.').on('all', (event, path, stats) => {
    console.log(event, path)
  })
}
