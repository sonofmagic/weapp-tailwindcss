import assert from 'node:assert/strict'

// 仅源码 tarball 的位置可变化；所有外部依赖版本与完整性必须一致。
export function assertSameRegistryDependencies(before, after, changes = []) {
  const allowedRemoved = new Set()
  const allowedAdded = new Set()
  for (const change of changes) {
    assert.ok(typeof change.name === 'string' && change.name.length && !change.name.includes('*'), '依赖变更必须指定确切包名')
    assert.ok(change.before !== change.after && (change.before || change.after), '依赖变更必须指定不同版本或移除')
    for (const version of [change.before, change.after]) assert.ok(version === null || /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version), '依赖变更必须指定确切版本或 null')
    if (change.before) allowedRemoved.add(`${change.name}@${change.before}`)
    if (change.after) allowedAdded.add(`${change.name}@${change.after}`)
  }
  const external = lock => Object.fromEntries(Object.entries(lock.packages).filter(([key]) => !key.includes('@file:')).sort(([a], [b]) => a.localeCompare(b)))
  const evidence = {}
  for (const mode of ['native', 'static', 'enabled']) {
    const previous = external(before[mode])
    const current = external(after[mode])
    evidence[mode] = []
    for (const key of new Set([...Object.keys(previous), ...Object.keys(current)])) {
      if (!current[key] && allowedRemoved.has(key)) {
        evidence[mode].push({ key, before: previous[key], after: null })
        delete previous[key]
      }
      else if (!previous[key] && allowedAdded.has(key)) {
        evidence[mode].push({ key, before: null, after: current[key] })
        delete current[key]
      }
    }
    // 已存在版本的完整性不能借升级声明放行；其他依赖仍逐项相等。
    assert.deepEqual(current, previous, `${mode} 的外部依赖图发生变化，不能计算源码收益`)
  }
  return evidence
}
