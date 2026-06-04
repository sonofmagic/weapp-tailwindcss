import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const demoRoot = fileURLToPath(new URL('..', import.meta.url))
const webDemoProjects = [
  'react-vite-tailwindcss-v3',
  'react-vite-tailwindcss-v4',
  'vue-vite-tailwindcss-v3',
  'vue-vite-tailwindcss-v4',
] as const

async function readDemoFile(relativePath: string) {
  return readFile(path.resolve(demoRoot, relativePath), 'utf8')
}

describe('demo/web vite matrix', () => {
  it('keeps every web demo package pinned to the latest Vite/React/Vue catalog entries', async () => {
    const packages = await Promise.all(
      webDemoProjects.map(project => readDemoFile(`web/${project}/package.json`).then(JSON.parse)),
    ) as Array<{
      name: string
      scripts?: Record<string, string>
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }>

    expect(packages.map(pkg => pkg.name)).toEqual([
      '@weapp-tailwindcss-demo/web-react-vite-tailwindcss-v3',
      '@weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4',
      '@weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v3',
      '@weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4',
    ])

    expect(packages.every(pkg => pkg.scripts?.build && pkg.scripts?.['build:weapp'])).toBe(true)
    expect(packages[0]?.devDependencies?.vite).toBe('catalog:vite8')
    expect(packages[1]?.devDependencies?.vite).toBe('catalog:vite8')
    expect(packages[2]?.devDependencies?.vite).toBe('catalog:vite8')
    expect(packages[3]?.devDependencies?.vite).toBe('catalog:vite8')
    expect(packages[0]?.devDependencies?.['@vitejs/plugin-react']).toBe('catalog:vitePluginReact6')
    expect(packages[1]?.devDependencies?.['@vitejs/plugin-react']).toBe('catalog:vitePluginReact6')
    expect(packages[2]?.devDependencies?.['@vitejs/plugin-vue']).toBe('catalog:vitePluginVue6')
    expect(packages[3]?.devDependencies?.['@vitejs/plugin-vue']).toBe('catalog:vitePluginVue6')
    expect(packages[0]?.dependencies?.react).toBe('catalog:react19')
    expect(packages[1]?.dependencies?.react).toBe('catalog:react19')
    expect(packages[2]?.dependencies?.vue).toBe('catalog:vue3')
    expect(packages[3]?.dependencies?.vue).toBe('catalog:vue3')
    expect(packages[0]?.devDependencies?.tailwindcss).toBe('catalog:tailwindcss3')
    expect(packages[1]?.devDependencies?.tailwindcss).toBe('catalog:tailwindcss4')
    expect(packages[2]?.devDependencies?.tailwindcss).toBe('catalog:tailwindcss3')
    expect(packages[3]?.devDependencies?.tailwindcss).toBe('catalog:tailwindcss4')
    for (const pkg of packages) {
      const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      }
      expect(deps['@tailwindcss/vite']).toBeUndefined()
      expect(deps['@tailwindcss/postcss']).toBeUndefined()
    }
  })

  it('keeps the shared target switch defaulting to web while allowing weapp opt-in', async () => {
    const helper = await readDemoFile('web/shared/vite-target.ts')

    expect(helper).toContain(`return target === 'weapp' ? 'weapp' : 'web'`)
    expect(helper).toContain(`generator: {`)
    expect(helper).toContain(`target,`)
    expect(helper).toContain(`rem2rpx: false`)
  })

  it('keeps v3 and v4 CSS entries separated by Tailwind major version', async () => {
    const sources = await Promise.all([
      readDemoFile('web/react-vite-tailwindcss-v3/src/style.css'),
      readDemoFile('web/vue-vite-tailwindcss-v3/src/style.css'),
      readDemoFile('web/react-vite-tailwindcss-v4/src/style.css'),
      readDemoFile('web/vue-vite-tailwindcss-v4/src/style.css'),
      readDemoFile('web/react-vite-tailwindcss-v3/tailwind.config.cjs'),
      readDemoFile('web/vue-vite-tailwindcss-v3/tailwind.config.cjs'),
    ])

    expect(sources[0]).toContain('@tailwind base;')
    expect(sources[1]).toContain('@tailwind base;')
    expect(sources[2]).toContain('@import "tailwindcss/theme.css" layer(theme);')
    expect(sources[3]).toContain('@import "tailwindcss/theme.css" layer(theme);')
    expect(sources[4]).toContain('content')
    expect(sources[5]).toContain('content')
    expect(sources[4]).toContain('preflight: false')
    expect(sources[5]).toContain('preflight: false')
  })

  it('keeps preflight disabled for the web demo CSS entries', async () => {
    const sources = await Promise.all([
      readDemoFile('web/react-vite-tailwindcss-v3/tailwind.config.cjs'),
      readDemoFile('web/vue-vite-tailwindcss-v3/tailwind.config.cjs'),
      readDemoFile('web/react-vite-tailwindcss-v4/src/style.css'),
      readDemoFile('web/vue-vite-tailwindcss-v4/src/style.css'),
    ])

    for (const source of sources) {
      expect(source).not.toContain('@import "tailwindcss/preflight.css"')
      expect(source).not.toContain('button, input, select, optgroup, textarea')
    }
  })

  it('keeps arbitrary, decimal, negative, and important utilities in every web demo', async () => {
    const sources = await Promise.all([
      readDemoFile('web/react-vite-tailwindcss-v3/src/main.tsx'),
      readDemoFile('web/react-vite-tailwindcss-v4/src/main.tsx'),
      readDemoFile('web/vue-vite-tailwindcss-v3/src/App.vue'),
      readDemoFile('web/vue-vite-tailwindcss-v4/src/App.vue'),
    ])

    for (const source of sources) {
      expect(source).toContain('rounded-[18.5px]')
      expect(source).toContain('bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)]')
      expect(source).toContain('-mt-1.5')
      expect(source).toContain('-ml-[5.5px]')
      expect(source).toContain('!p-[18.5px]')
      expect(source).toContain('!-translate-y-[3.5px]')
      expect(source).toContain('opacity-[0.82]')
      expect(source).toContain('scale-[1.03]')
    }
  })
})
