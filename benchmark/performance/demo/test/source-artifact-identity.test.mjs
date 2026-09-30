import { expect, it } from 'vitest'
import { assertSameRegistryDependencies } from '../../scripts/source-generation/identity.mjs'

const locks = (external, local = 'before') => Object.fromEntries(['native', 'static', 'enabled'].map(mode => [mode, { packages: { [`weapp-tailwindcss@file:${local}.tgz`]: { resolution: { integrity: local } }, ...external } }]))
it('源码 tarball 路径与内容可不同，外部依赖必须固定', () => {
  const registry = { 'vite@8.0.0': { resolution: { integrity: 'sha512-vite' } } }
  expect(() => assertSameRegistryDependencies(locks(registry), locks(registry, 'after'))).not.toThrow()
  expect(() => assertSameRegistryDependencies(locks(registry), locks({ 'vite@8.0.1': registry['vite@8.0.0'] }))).toThrow('外部依赖图')
  expect(() => assertSameRegistryDependencies(locks(registry), locks({ 'vite@8.0.0': { resolution: { integrity: 'changed' } } }))).toThrow('外部依赖图')
})

it('依赖实验仅放行显式版本的新增或移除，并保存完整性证据', () => {
  const old = { resolution: { integrity: 'sha512-old' } }
  const next = { resolution: { integrity: 'sha512-next' } }
  const changes = [{ name: 'oxc-parser', before: '0.151.0', after: '0.152.0' }]
  const before = locks({ 'oxc-parser@0.151.0': old })
  const after = locks({ 'oxc-parser@0.152.0': next })
  expect(assertSameRegistryDependencies(before, after, changes).enabled).toHaveLength(2)
  expect(() => assertSameRegistryDependencies(before, locks({ 'oxc-parser@0.153.0': next }), changes)).toThrow('外部依赖图')
  expect(() => assertSameRegistryDependencies(before, locks({ 'oxc-parser@0.151.0': next }), changes)).toThrow('外部依赖图')
  expect(() => assertSameRegistryDependencies(before, after, [{ ...changes[0], after: '^0.152.0' }])).toThrow('确切版本')
  expect(assertSameRegistryDependencies(locks({ 'es-toolkit@1.52.0': old }), locks({}), [{ name: 'es-toolkit', before: '1.52.0', after: null }]).enabled).toEqual([{ key: 'es-toolkit@1.52.0', before: old, after: null }])
})
