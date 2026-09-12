import YAML from 'yaml'

export function parseWorkspaceLockfile(source: string): Record<string, any> {
  const documents = YAML.parseAllDocuments(source).map((document) => {
    if (document.errors.length) {
      throw document.errors[0]
    }
    return document.toJS()
  })
  // pnpm 12 将工具自身依赖与项目依赖分段保存；只读取带项目安装设置的文档。
  const workspaces = documents.filter(document => document?.settings && document?.importers)
  if (workspaces.length !== 1) {
    throw new Error(`Expected one workspace lockfile document, received ${workspaces.length}`)
  }
  return workspaces[0]
}
