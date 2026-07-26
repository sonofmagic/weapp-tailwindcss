import fs from 'node:fs'
import path from 'node:path'
import { generateNativeStylesheet } from '@weapp-tailwindcss/react-native/tailwind'

describe('Expo example manifest', () => {
  it('uses an explicit entrypoint for pnpm workspace layouts', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')) as { main: string }
    expect(packageJson.main).toBe('src/index.ts')
    expect(fs.existsSync(path.resolve(process.cwd(), packageJson.main))).toBe(true)
  })

  it('contains the native utility rules used by App.tsx', async () => {
    const manifest = await generateNativeStylesheet({
      projectRoot: process.cwd(),
      cssEntries: [path.resolve(process.cwd(), 'global.css')],
      candidates: ['flex', 'items-center', 'justify-center', 'w-[180px]', 'h-[48px]', 'rounded-lg', 'bg-blue-500', 'dark:bg-slate-900', 'ios:px-4', 'android:px-2', 'text-white'],
      sourceGlobs: ['./src/**/*.{js,jsx,ts,tsx}'],
    })
    expect(manifest.rules.flex?.[0]?.style).toEqual({ display: 'flex' })
    expect(manifest.rules['w-[180px]']?.[0]?.style).toEqual({ width: 180 })
    expect(manifest.rules['dark:bg-slate-900']?.[0]?.colorScheme).toBe('dark')
  })
})
