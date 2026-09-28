import type { Input, Node, Root } from 'postcss'
import { fingerprintOptions } from './fingerprint'

const standardFields = new Set(['type', 'selector', 'name', 'params', 'prop', 'value', 'important', 'text', 'nodes', 'raws', 'source', 'parent', 'lastEach', 'indexes', 'rawCache', 'proxyCache'])

function inputIdentity(input: Input) {
  const serialized = input.toJSON() as { id?: string }
  delete serialized.id
  return JSON.stringify(serialized)
}

/** 匿名 Input 的随机 id 不描述来源；缓存命中后必须绑定回本轮 Input。 */
export function rootCacheIdentity(root: Root) {
  const inputs = new Map<Input, number>()
  const records: unknown[] = []
  const record = (node: Node) => {
    const source = node.source
    let inputId: number | undefined
    if (source) {
      inputId = inputs.get(source.input)
      if (inputId === undefined) {
        inputId = inputs.size
        inputs.set(source.input, inputId)
      }
    }
    const value = node as Node & Record<string, unknown>
    const extra = Object.keys(node).filter(key => !standardFields.has(key))
    // 遍历游标与字符串缓存不是 AST 语义；保留结构、真实字段、raws 以及来源位置。
    records.push([
      node.type,
      value.selector,
      value.name,
      value.params,
      value.prop,
      value.value,
      value.important,
      value.text,
      Array.isArray(value.nodes) ? value.nodes.length : undefined,
      node.raws,
      inputId,
      source?.start?.offset,
      source?.start?.line,
      source?.start?.column,
      source?.end?.offset,
      source?.end?.line,
      source?.end?.column,
      extra.length ? fingerprintOptions(Object.fromEntries(extra.map(key => [key, value[key]]))) : undefined,
    ])
  }
  record(root)
  root.walk(record)
  return JSON.stringify([records, [...inputs.keys()].map(inputIdentity)])
}

export function cloneRootWithCurrentSources(cached: Root, current?: Root) {
  const cloned = cached.clone()
  if (!current) {
    return cloned
  }
  const inputs = new Map<string, Input>()
  const visited = new Set<Input>()
  const collect = (node: Node) => {
    const input = node.source?.input
    if (input && !visited.has(input)) {
      visited.add(input)
      inputs.set(inputIdentity(input), input)
    }
  }
  collect(current)
  current.walk(collect)
  const replacements = new Map<Input, Input | undefined>()
  const rebind = (node: Node) => {
    const source = node.source
    if (!source) {
      return
    }
    if (!replacements.has(source.input)) {
      replacements.set(source.input, inputs.get(inputIdentity(source.input)))
    }
    const input = replacements.get(source.input)
    if (input) {
      node.source = { ...source, input }
    }
  }
  rebind(cloned)
  cloned.walk(rebind)
  return cloned
}
