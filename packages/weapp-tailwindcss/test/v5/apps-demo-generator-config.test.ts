import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveCssEntrySource } from '@/bundlers/shared/generator-css'

const repositoryRoot = path.resolve(__dirname, '../../../..')

const demoProjects = [
  'gulp-tailwindcss-v3',
  'gulp-tailwindcss-v4',
  'mpx-tailwindcss-v3',
  'mpx-tailwindcss-v4',
  'taro-webpack-react-tailwindcss-v3',
  'taro-webpack-react-tailwindcss-v4',
  'taro-webpack-vue3-tailwindcss-v3',
  'taro-webpack-vue3-tailwindcss-v4',
  'taro-vite-react-tailwindcss-v3',
  'taro-vite-react-tailwindcss-v4',
  'taro-vite-vue3-tailwindcss-v3',
  'taro-vite-vue3-tailwindcss-v4',
  'uni-app-vite-tailwindcss-v3',
  'uni-app-vite-tailwindcss-v4',
  'weapp-vite-tailwindcss-v3',
  'weapp-vite-tailwindcss-v4',
] as const

const tailwindV3Projects = demoProjects.filter(project => project.endsWith('-v3'))
const tailwindV4Projects = demoProjects.filter(project => project.endsWith('-v4'))
const subPackageRoots = ['sub-normal', 'sub-independent'] as const
const tailwindV4DemoCssEntries = [
  'demo/gulp-tailwindcss-v4/src/app.css',
  'demo/mpx-tailwindcss-v4/src/app.css',
  'demo/taro-webpack-react-tailwindcss-v4/src/app.css',
  'demo/taro-webpack-vue3-tailwindcss-v4/src/app.css',
  'demo/taro-vite-react-tailwindcss-v4/src/app.css',
  'demo/taro-vite-vue3-tailwindcss-v4/src/app.css',
  'demo/uni-app-vite-tailwindcss-v4/src/main.css',
  'demo/weapp-vite-tailwindcss-v4/app.scss',
] as const

async function readProjectFile(relativePath: string) {
  return readFile(path.resolve(repositoryRoot, relativePath), 'utf8')
}

async function readProjectJson<T>(relativePath: string) {
  return JSON.parse(await readProjectFile(relativePath)) as T
}

async function fileExists(relativePath: string) {
  try {
    await readProjectFile(relativePath)
    return true
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function appConfigPath(project: string) {
  if (project.startsWith('taro-')) {
    return `demo/${project}/src/app.config.ts`
  }
  if (project.startsWith('uni-app-')) {
    return `demo/${project}/src/pages.json`
  }
  if (project.startsWith('gulp-')) {
    return `demo/${project}/src/app.json`
  }
  if (project.startsWith('mpx-')) {
    return `demo/${project}/src/app.mpx`
  }
  if (project === 'weapp-vite-tailwindcss-v3') {
    return `demo/${project}/miniprogram/app.json.ts`
  }
  return `demo/${project}/app.json`
}

function subPackageStyleCandidates(project: string, subPackage: typeof subPackageRoots[number]) {
  const extensions = project.endsWith('-v3') ? ['scss', 'css'] : ['css']
  if (project.startsWith('weapp-vite-tailwindcss-v3')) {
    return extensions.map(extension => `demo/${project}/miniprogram/${subPackage}/pages/index.${extension}`)
  }
  if (project.startsWith('weapp-vite-tailwindcss-v4')) {
    return extensions.map(extension => `demo/${project}/${subPackage}/pages/index.${extension}`)
  }
  return extensions.map(extension => `demo/${project}/src/${subPackage}/pages/index.${extension}`)
}

async function readFirstExistingProjectFile(relativePaths: string[]) {
  for (const relativePath of relativePaths) {
    if (await fileExists(relativePath)) {
      return readProjectFile(relativePath)
    }
  }
  throw new Error(`Missing project file candidates: ${relativePaths.join(', ')}`)
}

function subPackagePageCandidates(project: string, subPackage: typeof subPackageRoots[number]) {
  if (project.includes('-react-')) {
    return [`demo/${project}/src/${subPackage}/pages/index.tsx`]
  }
  if (project.includes('-vue3-') || project.startsWith('uni-app-')) {
    return [`demo/${project}/src/${subPackage}/pages/index.vue`]
  }
  if (project.startsWith('mpx-')) {
    return [`demo/${project}/src/${subPackage}/pages/index.mpx`]
  }
  if (project.startsWith('weapp-vite-tailwindcss-v3')) {
    return [`demo/${project}/miniprogram/${subPackage}/pages/index.wxml`]
  }
  if (project.startsWith('weapp-vite-tailwindcss-v4')) {
    return [`demo/${project}/${subPackage}/pages/index.wxml`]
  }
  return [`demo/${project}/src/${subPackage}/pages/index.wxml`]
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
      'demo/taro-webpack-react-tailwindcss-v4/config/index.ts',
      'demo/taro-webpack-vue3-tailwindcss-v4/config/index.ts',
      'demo/taro-vite-react-tailwindcss-v4/config/index.ts',
      'demo/taro-vite-vue3-tailwindcss-v4/config/index.ts',
      'demo/uni-app-vite-tailwindcss-v4/vite.config.ts',
      'demo/weapp-vite-tailwindcss-v4/vite.config.ts',
    ]
    const [configs, cssEntries] = await Promise.all([
      Promise.all(configPaths.map(readProjectFile)),
      Promise.all(tailwindV4DemoCssEntries.map(readProjectFile)),
    ])

    expect(configs.join('\n')).not.toContain('cssEntries')
    for (const [index, configSource] of configs.entries()) {
      expect(configSource, configPaths[index]).toContain('tailwindcssBasedir: process.cwd()')
    }
    for (const cssSource of cssEntries) {
      expect(cssSource).toContain('tailwindcss')
    }
  })

  it('keeps every Tailwind CSS v4 demo entry compatible with default import fallback', async () => {
    for (const cssEntry of tailwindV4DemoCssEntries) {
      const source = await readProjectFile(cssEntry)
      const fallbackSource = source.replaceAll('@import "tailwindcss"', '@import "weapp-tailwindcss"')
      expect(fallbackSource, cssEntry).toContain('@import "weapp-tailwindcss"')

      const resolved = resolveCssEntrySource(
        fallbackSource,
        path.dirname(path.resolve(repositoryRoot, cssEntry)),
        { importFallback: true, removeConfig: false },
      )

      expect(resolved?.css, cssEntry).toContain('@import "tailwindcss"')
      expect(resolved?.css, cssEntry).not.toContain('@import "weapp-tailwindcss"')
    }
  })

  it('keeps removed demo families out of the active matrix tests', () => {
    expect(demoProjects.some(project => project.includes('v5'))).toBe(false)
    expect(demoProjects.some(project => project.includes('uni-app-x'))).toBe(false)
  })

  it('keeps Taro demo names explicit about React and Vue3 framework variants', () => {
    const taroProjects = demoProjects.filter(project => project.startsWith('taro-'))

    expect(taroProjects.every(project => project.includes('-react-') || project.includes('-vue3-'))).toBe(true)
    expect(taroProjects.filter(project => project.includes('-react-')).length).toBe(4)
    expect(taroProjects.filter(project => project.includes('-vue3-')).length).toBe(4)
  })

  it('keeps every demo wired with normal and independent subpackages', async () => {
    for (const project of demoProjects) {
      const source = await readProjectFile(appConfigPath(project))

      expect(source, project).toContain('sub-normal')
      expect(source, project).toContain('sub-independent')
      expect(source, project).toContain('independent')
    }
  })

  it('keeps subpackage Tailwind entries on isolated @config files', async () => {
    for (const project of demoProjects) {
      for (const subPackage of subPackageRoots) {
        const configPath = `demo/${project}/tailwind.config.${subPackage}.js`
        const tsConfigPath = `demo/${project}/tailwind.config.${subPackage}.ts`
        const configSource = await fileExists(configPath)
          ? await readProjectFile(configPath)
          : await readProjectFile(tsConfigPath)
        const styleSource = await readFirstExistingProjectFile(subPackageStyleCandidates(project, subPackage))

        expect(configSource, `${project}/${subPackage}`).toContain(subPackage)
        expect(configSource, `${project}/${subPackage}`).toContain(subPackage.replace('sub-', ''))
        expect(styleSource, `${project}/${subPackage}`).toContain('@config')
        expect(styleSource, `${project}/${subPackage}`).toContain(`tailwind.config.${subPackage}.`)
        expect(
          styleSource.includes('tailwindcss') || styleSource.includes('@tailwind'),
          `${project}/${subPackage}`,
        ).toBe(true)

        const pageExists = await Promise.all(subPackagePageCandidates(project, subPackage).map(fileExists))
        expect(pageExists.some(Boolean), `${project}/${subPackage}`).toBe(true)
      }
    }
  })
})
