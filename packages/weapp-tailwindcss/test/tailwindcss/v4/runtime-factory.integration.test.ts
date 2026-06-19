import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { transformLiteralText } from '@/js'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'
import { createTailwindcssRuntimeForBase } from '@/tailwindcss/v4'

describe('tailwindcss/v4 runtime integration with @config + cssEntries', () => {
  it('preserves entry base, collects class set, and escapes runtime literals', async () => {
    const workspaceRoot = path.resolve(__dirname, '../../../../..')
    const fixtureRoot = path.resolve(__dirname, '../../fixtures/tailwind-v4-config-import')
    const cssEntry = path.resolve(fixtureRoot, 'src/app.css')
    const fixtureModules = path.resolve(fixtureRoot, 'node_modules')
    const tailwindcss4Path = path.resolve(workspaceRoot, 'node_modules/tailwindcss4')
    const fixtureTailwindcss = path.resolve(fixtureModules, 'tailwindcss')

    await fs.mkdir(fixtureModules, { recursive: true })
    try {
      await fs.rm(fixtureTailwindcss, { recursive: true, force: true })
    }
    catch {}
    await fs.symlink(tailwindcss4Path, fixtureTailwindcss, 'dir')

    const runtime = createTailwindcssRuntimeForBase(fixtureRoot, [cssEntry], {
      tailwindcss: {
        packageName: 'tailwindcss4',
        version: 4,
        resolve: {
          paths: [path.resolve(workspaceRoot, 'node_modules')],
        },
      },
      tailwindcssRuntimeOptions: undefined,
      supportCustomLengthUnits: true,
      appType: 'taro',
    } as any)

    await runtime.extract({ write: false })

    const classSet = await collectRuntimeClassSet(runtime, { force: true })

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

  it('falls back to generator source scan when runtime extract returns an empty class set', async () => {
    const workspaceRoot = path.resolve(__dirname, '../../../../..')
    const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-v4-runtime-fallback-'))
    const cssEntry = path.resolve(fixtureRoot, 'src/app.css')
    const template = path.resolve(fixtureRoot, 'src/pages/index/index.wxml')

    try {
      await fs.mkdir(path.dirname(template), { recursive: true })
      await fs.writeFile(
        path.resolve(fixtureRoot, 'tailwind.config.js'),
        [
          'module.exports = {',
          '  content: ["./src/**/*.{wxml,html,js,ts}"],',
          '}',
        ].join('\n'),
        'utf8',
      )
      await fs.writeFile(
        cssEntry,
        [
          '@config "../tailwind.config.js";',
          '@import "tailwindcss";',
          '@source "./pages/**/*.{wxml,html,js,ts}";',
        ].join('\n'),
        'utf8',
      )
      await fs.writeFile(
        template,
        '<view class="text-[#aa11bb] bg-[#bb11aa]">runtime fallback</view>',
        'utf8',
      )
      const runtime = createTailwindcssRuntimeForBase(fixtureRoot, [cssEntry], {
        tailwindcss: {
          packageName: 'tailwindcss4',
          version: 4,
          resolve: {
            paths: [path.resolve(workspaceRoot, 'node_modules')],
          },
        },
        tailwindcssRuntimeOptions: undefined,
        supportCustomLengthUnits: true,
        appType: 'native',
      } as any)
      const originalExtract = runtime.extract.bind(runtime)
      runtime.extract = async (options) => {
        await originalExtract(options)
        return {
          classList: [],
          classSet: new Set<string>(),
        } as Awaited<ReturnType<typeof originalExtract>>
      }

      const classSet = await collectRuntimeClassSet(runtime, {
        clearCache: true,
        force: true,
      })

      expect(classSet.has('text-[#aa11bb]')).toBe(true)
      expect(classSet.has('bg-[#bb11aa]')).toBe(true)
    }
    finally {
      await fs.rm(fixtureRoot, { force: true, recursive: true })
    }
  })
})
