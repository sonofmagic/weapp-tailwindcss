import type { OutputBundle, OutputChunk } from 'rollup'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { parseCssImportSpecifier, postcss } from '@weapp-tailwindcss/postcss/transform'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'

type CssGraph = Map<string, Set<string>>
type ChunkWithCss = OutputChunk & {
  viteMetadata?: { importedCss?: Iterable<string> }
}

function outputKey(file: string) {
  // 此处只处理 bundle 的逻辑名称，不能作为文件系统路径使用。
  return path.posix.normalize(normalizeOutputPathKey(file))
}

function collectReachable(graph: CssGraph, roots: Iterable<string>) {
  const visited = new Set<string>()
  const pending = [...roots]
  while (pending.length > 0) {
    const file = pending.pop()!
    if (visited.has(file) || !graph.has(file)) {
      continue
    }
    visited.add(file)
    pending.push(...graph.get(file)!)
  }
  return visited
}

function collectSourceComponents(graph: CssGraph) {
  let nextIndex = 0
  const indexes = new Map<string, number>()
  const lowLinks = new Map<string, number>()
  const stack: string[] = []
  const onStack = new Set<string>()
  const components: string[][] = []
  const owners = new Map<string, number>()
  const visit = (file: string) => {
    const index = nextIndex++
    indexes.set(file, index)
    lowLinks.set(file, index)
    stack.push(file)
    onStack.add(file)
    for (const target of graph.get(file)!) {
      if (!indexes.has(target)) {
        visit(target)
        lowLinks.set(file, Math.min(lowLinks.get(file)!, lowLinks.get(target)!))
      }
      else if (onStack.has(target)) {
        lowLinks.set(file, Math.min(lowLinks.get(file)!, indexes.get(target)!))
      }
    }
    if (lowLinks.get(file) !== index) {
      return
    }
    const component: string[] = []
    let member: string
    do {
      member = stack.pop()!
      onStack.delete(member)
      owners.set(member, components.length)
      component.push(member)
    } while (member !== file)
    components.push(component)
  }
  for (const file of graph.keys()) {
    if (!indexes.has(file)) {
      visit(file)
    }
  }
  const importedComponents = new Set<number>()
  for (const [file, targets] of graph) {
    for (const target of targets) {
      if (owners.get(file) !== owners.get(target)) {
        importedComponents.add(owners.get(target)!)
      }
    }
  }
  return components.filter((_, index) => !importedComponents.has(index))
}

/** 按最终入口及 CSS 导入关系收集每个样式产物可见的变量上下文。 */
export function collectCssCalcScopes(bundle: OutputBundle, options: {
  matchesCss: (file: string) => boolean
}): Map<string, Set<string>> {
  const assets = new Map(Object.entries(bundle).flatMap(([key, output]) => {
    const file = outputKey(output.fileName || key)
    return output.type === 'asset' && options.matchesCss(file) ? [[file, output] as const] : []
  }))
  const graph: CssGraph = new Map()
  for (const [file, asset] of assets) {
    const targets = new Set<string>()
    const source = typeof asset.source === 'string' ? asset.source : Buffer.from(asset.source).toString()
    postcss.parse(source).walkAtRules('import', (rule) => {
      const request = parseCssImportSpecifier(rule.params)?.specifier
      if (!request || /^(?:[a-z][a-z\d+.-]*:|\/|\\\\|#)/i.test(request)) {
        return
      }
      const target = outputKey(path.posix.join(path.posix.dirname(file), outputKey(request.replace(/[?#].*$/, ''))))
      if (assets.has(target)) {
        targets.add(target)
      }
    })
    graph.set(file, targets)
  }

  const scopes = new Map<string, Set<string>>()
  const addScope = (roots: Iterable<string>) => {
    const visible = collectReachable(graph, roots)
    for (const file of visible) {
      const scope = scopes.get(file) ?? new Set<string>()
      for (const target of visible) {
        scope.add(target)
      }
      scopes.set(file, scope)
    }
  }
  const chunks = new Map(Object.entries(bundle).flatMap(([key, output]) => output.type === 'chunk'
    ? [[outputKey(output.fileName || key), output as ChunkWithCss] as const]
    : []))
  for (const [file, entry] of chunks) {
    if (!entry.isEntry && !entry.isDynamicEntry) {
      continue
    }
    const roots = new Set<string>()
    const entryName = path.posix.parse(file)
    const matchingAssets = [...assets.keys()].filter((assetFile) => {
      const assetName = path.posix.parse(assetFile)
      return assetName.dir === entryName.dir && assetName.name === entryName.name
    })
    if (matchingAssets.length === 1) {
      roots.add(matchingAssets[0]!)
    }
    const visited = new Set<string>()
    const pending = [file]
    while (pending.length > 0) {
      const chunkFile = pending.pop()!
      const chunk = chunks.get(chunkFile)
      if (!chunk || visited.has(chunkFile)) {
        continue
      }
      visited.add(chunkFile)
      for (const css of chunk.viteMetadata?.importedCss ?? []) {
        const key = outputKey(css)
        if (assets.has(key)) {
          roots.add(key)
        }
      }
      // 动态入口可能属于互斥页面，不把 dynamicImports 当作同时可见的样式。
      for (const imported of chunk.imports) {
        const key = outputKey(imported)
        pending.push(chunks.has(key) ? key : outputKey(path.posix.join(path.posix.dirname(chunkFile), key)))
      }
    }
    addScope(roots)
  }

  // 先缩合循环，再从无入边分量补齐独立 CSS 根，结果不依赖 bundle 的遍历顺序。
  for (const component of collectSourceComponents(graph)) {
    if (component.some(file => !scopes.has(file))) {
      addScope(component)
    }
  }
  return scopes
}
