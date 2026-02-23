#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { FRAMEWORK_CASES } from './config.mjs'
import { parseCsvSet, resolveWorkspaceRoot, sanitizeTextPaths } from './shared.mjs'

async function pathExists(file) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function ensureDir(file) {
  await fs.mkdir(file, { recursive: true })
}

async function clearProjectDirectory(targetRoot) {
  await fs.rm(targetRoot, { recursive: true, force: true })
  await ensureDir(targetRoot)
}

async function copyOptional(sourceFile, targetFile) {
  if (!(await pathExists(sourceFile))) {
    return false
  }
  await ensureDir(path.dirname(targetFile))
  await fs.cp(sourceFile, targetFile, { recursive: true, force: true })
  return true
}

async function writeFile(targetFile, content) {
  await ensureDir(path.dirname(targetFile))
  await fs.writeFile(targetFile, content, 'utf8')
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
}

async function linkResolverNodeModules(sourceRoot, targetRoot, key) {
  const sourceNodeModules = path.join(sourceRoot, 'node_modules')
  if (!(await pathExists(sourceNodeModules))) {
    throw new Error(`[${key}] resolver node_modules not found: ${sourceNodeModules}`)
  }
  const targetNodeModules = path.join(targetRoot, 'node_modules')
  await fs.rm(targetNodeModules, { recursive: true, force: true })
  const relativeTarget = path.relative(targetRoot, sourceNodeModules)
  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
  await fs.symlink(relativeTarget, targetNodeModules, symlinkType)
}

async function buildPackageJson(caseMeta, sourceRoot, targetRoot) {
  const sourcePackageJsonPath = path.join(sourceRoot, 'package.json')
  let sourcePackage = null
  try {
    const sourceRaw = await fs.readFile(sourcePackageJsonPath, 'utf8')
    sourcePackage = JSON.parse(sourceRaw)
  }
  catch {}

  const scripts = {
    build: '',
    [caseMeta.devScript]: '',
  }

  if (caseMeta.key === 'uni-app-vue3') {
    scripts.build = 'uni build -p mp-weixin'
    scripts[caseMeta.devScript] = 'uni -p mp-weixin'
  }
  else if (caseMeta.key === 'taro-vue3') {
    scripts.build = 'BABEL=1 taro build --type weapp --no-check'
    scripts[caseMeta.devScript] = 'taro build --type weapp --watch --no-check'
  }
  else if (caseMeta.key === 'weapp-vite-wevu') {
    scripts.build = 'weapp-vite build'
    scripts[caseMeta.devScript] = 'weapp-vite dev'
  }
  else {
    throw new Error(`[${caseMeta.key}] unsupported framework key`)
  }

  return {
    name: `benchmark-framework-compare-${caseMeta.key}`,
    private: true,
    version: '0.0.0',
    type: sourcePackage?.type,
    engines: sourcePackage?.engines,
    dependencies: sourcePackage?.dependencies,
    devDependencies: sourcePackage?.devDependencies,
    scripts,
  }
}

async function prepareUniProject(sourceRoot, targetRoot) {
  await copyOptional(path.join(sourceRoot, '.npmrc'), path.join(targetRoot, '.npmrc'))
  await copyOptional(path.join(sourceRoot, 'tsconfig.json'), path.join(targetRoot, 'tsconfig.json'))
  await copyOptional(path.join(sourceRoot, 'tailwind.config.js'), path.join(targetRoot, 'tailwind.config.js'))
  await copyOptional(path.join(sourceRoot, 'src/manifest.json'), path.join(targetRoot, 'src/manifest.json'))

  await writeFile(
    path.join(targetRoot, 'vite.config.ts'),
    `import uni from '@dcloudio/vite-plugin-uni'

export default {
  plugins: [
    uni(),
  ],
  build: {
    minify: false,
    sourcemap: true,
  },
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/main.ts'),
    `import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/App.vue'),
    `<template>
  <view class="app-root" />
</template>

<style>
.app-root {
  min-height: 100%;
}
</style>
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/pages.json'),
    `{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "benchmark"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTitleText": "benchmark",
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#ffffff"
  }
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/pages/index/index.vue'),
    `<template>
  <view class="benchmark-entry">benchmark-entry</view>
</template>
`,
  )
}

async function prepareTaroProject(sourceRoot, targetRoot) {
  await copyOptional(path.join(sourceRoot, '.npmrc'), path.join(targetRoot, '.npmrc'))
  await copyOptional(path.join(sourceRoot, 'tsconfig.json'), path.join(targetRoot, 'tsconfig.json'))
  await copyOptional(path.join(sourceRoot, 'babel.config.js'), path.join(targetRoot, 'babel.config.js'))
  await copyOptional(path.join(sourceRoot, 'postcss.config.js'), path.join(targetRoot, 'postcss.config.js'))
  await copyOptional(path.join(sourceRoot, 'tailwind.config.js'), path.join(targetRoot, 'tailwind.config.js'))
  await copyOptional(path.join(sourceRoot, 'project.config.json'), path.join(targetRoot, 'project.config.json'))
  await copyOptional(path.join(sourceRoot, 'project.private.config.json'), path.join(targetRoot, 'project.private.config.json'))

  await writeFile(
    path.join(targetRoot, 'config/index.ts'),
    `import { defineConfig, UserConfigExport } from '@tarojs/cli'

export default defineConfig<'webpack5'>((merge) => {
  const config: UserConfigExport<'webpack5'> = {
    projectName: 'benchmark-framework-compare-taro-vue3',
    date: '2026-02-24',
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
          },
        },
        cssModules: {
          enable: false,
          config: {},
        },
      },
      webpackChain() {},
    },
    h5: {},
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
})
`,
  )

  await writeFile(
    path.join(targetRoot, 'config/dev.ts'),
    `export default {
  env: {
    NODE_ENV: '"development"',
  },
  mini: {},
  h5: {},
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'config/prod.ts'),
    `export default {
  env: {
    NODE_ENV: '"production"',
  },
  mini: {},
  h5: {},
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/app.ts'),
    `import { createApp } from 'vue'

const App = createApp({})

export default App
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/app.config.ts'),
    `export default defineAppConfig({
  pages: ['pages/index/index'],
  window: {
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'benchmark',
    navigationBarTextStyle: 'black',
  },
})
`,
  )

  await writeFile(
    path.join(targetRoot, 'src/pages/index/index.vue'),
    `<template>
  <view class="benchmark-entry">benchmark-entry</view>
</template>
`,
  )
}

async function prepareWeappViteProject(sourceRoot, targetRoot) {
  await copyOptional(path.join(sourceRoot, '.npmrc'), path.join(targetRoot, '.npmrc'))
  await copyOptional(path.join(sourceRoot, 'tsconfig.json'), path.join(targetRoot, 'tsconfig.json'))
  await copyOptional(path.join(sourceRoot, 'tsconfig.node.json'), path.join(targetRoot, 'tsconfig.node.json'))
  await copyOptional(path.join(sourceRoot, 'vite-env.d.ts'), path.join(targetRoot, 'vite-env.d.ts'))
  await copyOptional(path.join(sourceRoot, 'postcss.config.js'), path.join(targetRoot, 'postcss.config.js'))
  await copyOptional(path.join(sourceRoot, 'tailwind.config.js'), path.join(targetRoot, 'tailwind.config.js'))
  await copyOptional(path.join(sourceRoot, 'project.config.json'), path.join(targetRoot, 'project.config.json'))
  await copyOptional(path.join(sourceRoot, 'project.private.config.json'), path.join(targetRoot, 'project.private.config.json'))

  await writeFile(
    path.join(targetRoot, 'vite.config.ts'),
    `export default {
  weapp: {
    srcRoot: './miniprogram',
  },
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'miniprogram/app.json'),
    `{
  "pages": [
    "pages/cart/index"
  ],
  "window": {
    "navigationBarTextStyle": "black"
  }
}
`,
  )

  await writeFile(
    path.join(targetRoot, 'miniprogram/app.ts'),
    `App({
  onLaunch() {},
})
`,
  )

  await writeFile(
    path.join(targetRoot, 'miniprogram/pages/cart/index.vue'),
    `<template>
  <view class="benchmark-entry">benchmark-entry</view>
</template>
`,
  )
}

async function prepareCase(workspaceRoot, caseMeta) {
  const sourceRoot = path.resolve(workspaceRoot, caseMeta.sourceProject)
  const targetRoot = path.resolve(workspaceRoot, caseMeta.project)

  await clearProjectDirectory(targetRoot)
  await linkResolverNodeModules(sourceRoot, targetRoot, caseMeta.key)
  await writeJson(path.join(targetRoot, 'package.json'), await buildPackageJson(caseMeta, sourceRoot, targetRoot))

  if (caseMeta.key === 'uni-app-vue3') {
    await prepareUniProject(sourceRoot, targetRoot)
  }
  else if (caseMeta.key === 'taro-vue3') {
    await prepareTaroProject(sourceRoot, targetRoot)
  }
  else if (caseMeta.key === 'weapp-vite-wevu') {
    await prepareWeappViteProject(sourceRoot, targetRoot)
  }
  else {
    throw new Error(`[${caseMeta.key}] unsupported framework key`)
  }
}

export async function prepareMinimalProjects(options) {
  const selectedCases = options.onlySet
    ? FRAMEWORK_CASES.filter(item => options.onlySet.has(item.key))
    : FRAMEWORK_CASES

  if (!selectedCases.length) {
    throw new Error('no framework case selected for minimal project prepare')
  }

  for (const caseMeta of selectedCases) {
    await prepareCase(options.workspaceRoot, caseMeta)
    process.stdout.write(`[framework-matrix] prepared minimal project ${caseMeta.key}\n`)
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const workspaceRoot = resolveWorkspaceRoot(process.env.INIT_CWD ?? process.cwd())
  const onlySet = parseCsvSet('--only', argv)
  try {
    await prepareMinimalProjects({
      workspaceRoot,
      onlySet,
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(sanitizeTextPaths(message, workspaceRoot))
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
