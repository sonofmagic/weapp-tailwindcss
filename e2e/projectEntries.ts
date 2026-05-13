import type { ProjectEntry } from './shared.ts'

export const E2E_PROJECTS = [
  {
    name: 'gulp-tailwindcss-v3',
    projectPath: 'gulp-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'gulp-tailwindcss-v4',
    projectPath: 'gulp-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'mpx-tailwindcss-v3',
    projectPath: 'mpx-tailwindcss-v3/dist/wx',
    cssFile: 'app.wxss',
    url: '/pages/index',
  },
  {
    name: 'mpx-tailwindcss-v4',
    projectPath: 'mpx-tailwindcss-v4/dist/wx',
    cssFile: 'app.wxss',
    url: '/pages/index',
  },
  {
    name: 'taro-webpack-react-tailwindcss-v3',
    projectPath: 'taro-webpack-react-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-webpack-react-tailwindcss-v4',
    projectPath: 'taro-webpack-react-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-react-tailwindcss-v3',
    projectPath: 'taro-vite-react-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-react-tailwindcss-v4',
    projectPath: 'taro-vite-react-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-webpack-vue3-tailwindcss-v3',
    projectPath: 'taro-webpack-vue3-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-webpack-vue3-tailwindcss-v4',
    projectPath: 'taro-webpack-vue3-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-vue3-tailwindcss-v3',
    projectPath: 'taro-vite-vue3-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-vue3-tailwindcss-v4',
    projectPath: 'taro-vite-vue3-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'uni-app-vite-tailwindcss-v3',
    projectPath: 'uni-app-vite-tailwindcss-v3/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'uni-app-vite-tailwindcss-v4',
    projectPath: 'uni-app-vite-tailwindcss-v4/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'weapp-vite-tailwindcss-v3',
    projectPath: 'weapp-vite-tailwindcss-v3',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'weapp-vite-tailwindcss-v4',
    projectPath: 'weapp-vite-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
] satisfies ProjectEntry[]

export const NATIVE_PROJECTS = [] satisfies ProjectEntry[]

function cloneProject(projects: ProjectEntry[], name: string): ProjectEntry {
  const project = projects.find(entry => entry.name === name)
  if (!project) {
    throw new Error(`Unknown project: ${name}`)
  }
  return {
    ...project,
  }
}

export function getE2EProject(name: string): ProjectEntry {
  return cloneProject(E2E_PROJECTS, name)
}

export function getNativeProject(name: string): ProjectEntry {
  return cloneProject(NATIVE_PROJECTS, name)
}
