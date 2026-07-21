import { describe, expect, it } from 'vitest'
import { rewriteDeclarationModuleSpecifiers } from '../../../../tools/weapp-tailwindcss-scripts/src/dts-module-specifiers'

describe('declaration module specifiers', () => {
  it('rewrites aliases and extensionless relative imports for type module packages', () => {
    const content = [
      "import type { Foo } from '@/types/foo'",
      "export * from './framework/index'",
      "export type { Bar } from '../shared/bar.js'",
      "type Lazy = import('./lazy').Lazy",
      "export type { External } from 'external-package'",
    ].join('\n')

    const declarationFiles = new Set([
      '/repo/packages/weapp-tailwindcss/dist/types/foo.d.ts',
      '/repo/packages/weapp-tailwindcss/dist/nested/framework/index.d.ts',
      '/repo/packages/weapp-tailwindcss/dist/nested/lazy.d.ts',
    ])

    expect(rewriteDeclarationModuleSpecifiers(
      content,
      '/repo/packages/weapp-tailwindcss/dist/nested/index.d.ts',
      '/repo/packages/weapp-tailwindcss/dist',
      declarationFiles,
    )).toBe([
      "import type { Foo } from '../types/foo.js'",
      "export * from './framework/index.js'",
      "export type { Bar } from '../shared/bar.js'",
      "type Lazy = import('./lazy.js').Lazy",
      "export type { External } from 'external-package'",
    ].join('\n'))
  })

  it('uses the matching runtime extension for declaration module kinds', () => {
    expect(rewriteDeclarationModuleSpecifiers(
      "export * from './entry'",
      '/repo/dist/index.d.cts',
      '/repo/dist',
    )).toBe("export * from './entry.cjs'")
    expect(rewriteDeclarationModuleSpecifiers(
      "export * from './entry'",
      '/repo/dist/index.d.mts',
      '/repo/dist',
    )).toBe("export * from './entry.mjs'")
  })

  it('resolves directory and parent entry declarations', () => {
    const declarationFiles = new Set([
      '/repo/dist/index.d.ts',
      '/repo/dist/compiler/index.d.ts',
      '/repo/dist/runtime/index.d.cts',
    ])
    const content = [
      "export type { Root } from '../..'",
      "export type { Compiler } from '../../compiler'",
      "export type { Runtime } from '../../runtime'",
    ].join('\n')

    expect(rewriteDeclarationModuleSpecifiers(
      content,
      '/repo/dist/bundlers/gulp/index.d.ts',
      '/repo/dist',
      declarationFiles,
    )).toBe([
      "export type { Root } from '../../index.js'",
      "export type { Compiler } from '../../compiler/index.js'",
      "export type { Runtime } from '../../runtime/index.cjs'",
    ].join('\n'))
  })
})
