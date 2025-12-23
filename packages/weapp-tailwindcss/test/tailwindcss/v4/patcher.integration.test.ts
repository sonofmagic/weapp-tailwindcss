import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { transformLiteralText } from '@/experimental/shared'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'
import { createPatcherForBase } from '@/tailwindcss/v4'

describe('tailwindcss/v4 patcher integration with @config + cssEntries', () => {
  it('preserves entry base, collects class set, and escapes runtime literals', async () => {
    const fixtureRoot = path.resolve(__dirname, '../../fixtures/tailwind-v4-config-import')
    const cssEntry = path.resolve(fixtureRoot, 'src/app.css')
    const fixtureModules = path.resolve(fixtureRoot, 'node_modules')
    const tailwindcss4Path = path.resolve(process.cwd(), 'node_modules/tailwindcss4')
    const fixtureTailwindcss = path.resolve(fixtureModules, 'tailwindcss')

    await fs.mkdir(fixtureModules, { recursive: true })
    try {
      await fs.rm(fixtureTailwindcss, { recursive: true, force: true })
    }
    catch {}
    await fs.symlink(tailwindcss4Path, fixtureTailwindcss, 'dir')

    const patcher = createPatcherForBase(fixtureRoot, [cssEntry], {
      tailwindcss: {
        packageName: 'tailwindcss4',
        version: 4,
        resolve: {
          paths: [path.resolve(process.cwd(), 'node_modules')],
        },
      },
      tailwindcssPatcherOptions: undefined,
      supportCustomLengthUnitsPatch: true,
      appType: 'taro',
    } as any)

    await patcher.extract({ write: false })

    const classSet = await collectRuntimeClassSet(patcher, { force: true })

    expect(classSet.has('px-[48rpx]')).toBe(true)

    const transformed = transformLiteralText('px-[48rpx] text-white', {
      classNameSet: classSet,
      arbitraryValues: { allowDoubleQuotes: true },
      alwaysEscape: false,
      unescapeUnicode: true,
    } as any)

    expect(transformed).toContain('px-_b48rpx_B')
    expect(transformed).not.toContain('px-[48rpx]')
  })
})
