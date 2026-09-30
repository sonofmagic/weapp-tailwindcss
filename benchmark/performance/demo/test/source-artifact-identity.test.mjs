import { expect, it } from 'vitest'
import { assertSameRegistryDependencies } from '../../scripts/source-generation/identity.mjs'

const locks = (external, local = 'before') => Object.fromEntries(['native', 'static', 'enabled'].map(mode => [mode, { packages: { [`weapp-tailwindcss@file:${local}.tgz`]: { resolution: { integrity: local } }, ...external } }]))
it('源码 tarball 路径与内容可不同，外部依赖必须固定', () => {
  const registry = { 'vite@8.0.0': { resolution: { integrity: 'sha512-vite' } } }
  expect(() => assertSameRegistryDependencies(locks(registry), locks(registry, 'after'))).not.toThrow()
  expect(() => assertSameRegistryDependencies(locks(registry), locks({ 'vite@8.0.1': registry['vite@8.0.0'] }))).toThrow('外部依赖图')
  expect(() => assertSameRegistryDependencies(locks(registry), locks({ 'vite@8.0.0': { resolution: { integrity: 'changed' } } }))).toThrow('外部依赖图')
})
