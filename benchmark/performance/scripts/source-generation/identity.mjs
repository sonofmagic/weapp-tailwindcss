import assert from 'node:assert/strict'

// 仅源码 tarball 的位置可变化；所有外部依赖版本与完整性必须一致。
export function assertSameRegistryDependencies(before, after) {
  const external = lock => Object.fromEntries(Object.entries(lock.packages).filter(([key]) => !key.includes('@file:')).sort(([a], [b]) => a.localeCompare(b)))
  for (const mode of ['native', 'static', 'enabled']) assert.deepEqual(external(after[mode]), external(before[mode]), `${mode} 的外部依赖图发生变化，不能计算源码收益`)
}
