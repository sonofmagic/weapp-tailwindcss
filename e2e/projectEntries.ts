import type { ProjectEntry } from './shared'

export const E2E_PROJECTS = [
  {
    name: 'uni-app',
    projectPath: 'uni-app/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-webpack5',
    projectPath: 'uni-app-webpack5/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-webpack-tailwindcss-v4',
    projectPath: 'uni-app-webpack-tailwindcss-v4/dist/build/mp-weixin',
    cssFile: 'common/main.wxss',
  },
  {
    name: 'uni-app-vue3-vite',
    projectPath: 'uni-app-vue3-vite/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'uni-app-tailwindcss-v4',
    projectPath: 'uni-app-tailwindcss-v4/dist/build/mp-weixin',
    cssFile: 'app.wxss',
  },
  {
    name: 'taro-app',
    projectPath: 'taro-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-webpack-tailwindcss-v4',
    projectPath: 'taro-webpack-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-app-vite',
    projectPath: 'taro-app-vite',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vite-tailwindcss-v4',
    projectPath: 'taro-vite-tailwindcss-v4',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'taro-vue3-app',
    projectPath: 'taro-vue3-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'gulp-app',
    projectPath: 'gulp-app',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'mpx-app',
    projectPath: 'mpx-app/dist/wx',
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
    name: 'native-mina',
    projectPath: 'native-mina',
    cssFile: 'dist/app.wxss',
  },
  {
    name: 'rax-app',
    projectPath: 'rax-app/build/wechat-miniprogram',
    cssFile: 'bundle.wxss',
  },
] satisfies ProjectEntry[]

export const NATIVE_PROJECTS = [
  {
    name: 'vite-native',
    projectPath: 'vite-native',
    cssFile: 'dist/app.wxss',
  },
  // skyline 有 bug 无法测试
  // {
  //   name: 'vite-native-skyline',
  //   projectPath: 'vite-native-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  {
    name: 'vite-native-ts',
    projectPath: 'vite-native-ts',
    cssFile: 'dist/app.wxss',
  },
  // {
  //   name: 'vite-native-ts-skyline',
  //   projectPath: 'vite-native-ts-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  {
    name: 'web-postcss7-compat',
    projectPath: 'web-postcss7-compat',
    cssFile: 'result.css',
    skipOpenAutomator: true,
  },
  // {
  //   name: 'native-skyline',
  //   projectPath: 'native-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  // {
  //   name: 'native-ts-skyline',
  //   projectPath: 'native-ts-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
] satisfies ProjectEntry[]

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
