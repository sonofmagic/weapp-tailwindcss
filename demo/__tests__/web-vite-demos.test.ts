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
    expect(helper).toContain(`rem2rpx: target === 'weapp'`)
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
    expect(sources[2]).toContain('@import "tailwindcss" source(none);')
    expect(sources[3]).toContain('@import "tailwindcss" source(none);')
    expect(sources[4]).toContain('content')
    expect(sources[5]).toContain('content')
  })
})
