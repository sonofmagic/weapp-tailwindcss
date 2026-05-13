import { readFile } from 'node:fs/promises'
import path from 'node:path'

const repositoryRoot = path.resolve(__dirname, '../../../..')

const demoProjects = [
  'gulp-tailwindcss-v3',
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v3',
  'mpx-tailwindcss-v4',
  'taro-webpack-tailwindcss-v3',
  'taro-webpack-tailwindcss-v4',
  'taro-vite-tailwindcss-v3',
  'taro-vite-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v3',
  'uni-app-vite-tailwindcss-v4',
  'weapp-vite-tailwindcss-v3',
  'weapp-vite-tailwindcss-v4',
] as const

const tailwindV3Projects = demoProjects.filter(project => project.endsWith('-v3'))
const tailwindV4Projects = demoProjects.filter(project => project.endsWith('-v4'))

async function readProjectFile(relativePath: string) {
  return readFile(path.resolve(repositoryRoot, relativePath), 'utf8')
}

async function readProjectJson<T>(relativePath: string) {
  return JSON.parse(await readProjectFile(relativePath)) as T
}

describe('demo matrix generator config', () => {
  it('keeps the runnable demo matrix as standalone workspace packages', async () => {
    const packages = await Promise.all(demoProjects.map(project => readProjectJson<{
      name: string
      private?: boolean
      scripts?: Record<string, string>
      repository?: { directory?: string }
    }>(`demo/${project}/package.json`)))

    expect(packages.map(item => item.name)).toEqual(demoProjects.map(project => `@weapp-tailwindcss-demo/${project}`))
    expect(packages.every(item => item.private)).toBe(true)
    expect(packages.every(item => typeof item.scripts?.build === 'string')).toBe(true)
    expect(packages.map(item => item.repository?.directory).filter(Boolean)).toEqual(
      demoProjects
        .filter(project => packages[demoProjects.indexOf(project)]?.repository?.directory)
        .map(project => `demo/${project}`),
    )
  })

  it('keeps Tailwind CSS v3 and v4 dependencies aligned with the directory suffix', async () => {
    for (const project of tailwindV3Projects) {
      const pkg = await readProjectJson<{
        scripts?: Record<string, string>
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }>(`demo/${project}/package.json`)
      const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      }

      expect(pkg.scripts?.postinstall, project).toBeUndefined()
      expect(deps.tailwindcss, project).toBe('catalog:tailwindcss3')
    }

    for (const project of tailwindV4Projects) {
      const pkg = await readProjectJson<{
        scripts?: Record<string, string>
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }>(`demo/${project}/package.json`)
      const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      }

      expect(pkg.scripts?.postinstall, project).toBeUndefined()
      expect(deps.tailwindcss, project).toBe('catalog:tailwindcss4')
      expect(deps['@weapp-tailwindcss/merge-v3'], project).toBeUndefined()
      expect(deps['@weapp-tailwindcss/variants-v3'], project).toBeUndefined()
    }
  })

  it('keeps Tailwind CSS v4 demos on standard CSS entry detection without cssEntries', async () => {
    const configPaths = [
      'demo/gulp-tailwindcss-v4/gulpfile.ts',
      'demo/mpx-tailwindcss-v4/mpx.config.js',
      'demo/taro-webpack-tailwindcss-v4/config/index.ts',
      'demo/taro-vite-tailwindcss-v4/config/index.ts',
      'demo/uni-app-vite-tailwindcss-v4/vite.config.ts',
      'demo/weapp-vite-tailwindcss-v4/vite.config.ts',
    ]
    const cssPaths = [
      'demo/gulp-tailwindcss-v4/src/app.css',
      'demo/mpx-tailwindcss-v4/src/app.css',
      'demo/taro-webpack-tailwindcss-v4/src/app.css',
      'demo/taro-vite-tailwindcss-v4/src/app.css',
      'demo/uni-app-vite-tailwindcss-v4/src/main.css',
      'demo/weapp-vite-tailwindcss-v4/app.css',
    ]

    const [configs, cssEntries] = await Promise.all([
      Promise.all(configPaths.map(readProjectFile)),
      Promise.all(cssPaths.map(readProjectFile)),
    ])

    expect(configs.join('\n')).not.toContain('cssEntries')
    for (const cssSource of cssEntries) {
      expect(cssSource).toContain('tailwindcss')
    }
  })

  it('keeps removed demo families out of the active matrix tests', () => {
    expect(demoProjects.some(project => project.includes('v5'))).toBe(false)
    expect(demoProjects.some(project => project.includes('taro-vue3'))).toBe(false)
    expect(demoProjects.some(project => project.includes('uni-app-x'))).toBe(false)
  })
})
