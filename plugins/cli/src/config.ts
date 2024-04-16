import { cosmiconfigSync } from 'cosmiconfig'

export function createConfigLoader() {
  const explorer = cosmiconfigSync('weapp-tw')

  function search(searchFrom?: string) {
    return explorer.search(searchFrom)
  }

  function load(filepath: string) {
    return explorer.load(filepath)
  }
  return {
    search,
    load
  }
}
