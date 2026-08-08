import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const lynxPackage = '@weapp-tailwindcss/lynx'
const examplePackage = '@weapp-tailwindcss/example-react-lynx'
const bundlePath = path.resolve(repoRoot, 'examples/react-lynx/dist/main.lynx.bundle')

const arbitraryUtilities = [
  'w-[123px]',
  'h-[45rpx]',
  'min-w-[calc(100%-2rem)]',
  'max-h-[var(--panel-height)]',
  'bg-[#123456]',
  'bg-[rgb(12,34,56)]',
  'bg-[radial-gradient(circle_at_20%_20%,#fff,#000)]',
  'text-[length:23px]',
  'text-[color:#c31d6b]',
  'leading-[1.25]',
  'tracking-[0.12em]',
  'p-[13px]',
  'px-[7.5px]',
  'rounded-[18px]',
  '[mask-type:luminance]',
  '[--panel-height:240px]',
  'bg-(--brand-color)',
  'text-black/[.35]',
  '!bg-[gray]',
  'hover:bg-[red]',
  'md:w-[200px]',
  'dark:text-[color:#fff]',
  'data-[state=open]:opacity-100',
  'supports-[backdrop-filter:blur(2px)]:backdrop-blur-[2px]',
  'before:content-[\'lynx\']',
  'group-[.is-active]:block',
  'aria-[sort=ascending]:underline',
  'aspect-[4/3]',
  'grid-cols-[200px_minmax(0,1fr)_80px]',
]

async function runPnpm(args: string[]) {
  await execa('pnpm', args, {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
    timeout: 300_000,
  })
}

describe('ReactLynx Rspeedy integration', () => {
  it('builds the public Lynx package before consuming its workspace export', async () => {
    await runPnpm(['--filter', lynxPackage, 'build'])
  }, 300_000)

  it('builds a real Lynx bundle with Tailwind className values', async () => {
    await runPnpm(['--filter', examplePackage, 'build'])

    const bundle = await fs.readFile(bundlePath)
    const bundleText = bundle.toString('latin1')
    expect(bundle.byteLength).toBeGreaterThan(1024)
    expect(bundleText).toContain('flex items-center justify-center bg-sky-500 p-6')
    expect(bundleText).toContain('text-lg font-bold text-white')
    expect(bundleText).toContain('weapp-tailwindcss + Lynx')
    for (const utility of arbitraryUtilities) {
      expect(bundleText, `missing generated class ${utility}`).toContain(utility)
    }
    expect(bundleText).not.toContain('@import "tailwindcss"')
  }, 300_000)
})
