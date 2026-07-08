import process from 'node:process'

export interface WebViteHmrCase {
  name: string
  projectDir: string
  devCommand: string[]
  readyLog?: RegExp
  styleRequired?: boolean
  sourceFile: string
  titleFrom?: string
  titleTo?: string
  classFrom: string
  classTo: string
  markerAttr: string
  expectedViteHmrPath?: string
  expectedViteHmrPathIncludes?: string
  sourceUpdateRequired?: boolean
  classUpdateRequired?: boolean
  classFlowRequired?: boolean
  styleProperty?: 'color' | 'backgroundColor'
  expectedStyleValue?: string
  reloadAllowed?: boolean
  targetSelector?: string
  matrixCoverage?: boolean
  titleHmrRetry?: boolean
}

const allWebViteHmrCases: WebViteHmrCase[] = [
  {
    name: 'web react vite Tailwind v4',
    projectDir: 'demo/web/react-vite-tailwindcss-v4',
    devCommand: ['exec', 'vite', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
    sourceFile: 'src/App.tsx',
    titleFrom: 'React Vite Tailwind CSS v4',
    titleTo: 'WEB-HMR-REACT-V4',
    classFrom: '<h1 className="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="react-v4" className="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'react-v4',
    styleRequired: false,
    classFlowRequired: false,
  },
  {
    name: 'web vue vite Tailwind v4',
    projectDir: 'demo/web/vue-vite-tailwindcss-v4',
    devCommand: ['exec', 'vite', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
    sourceFile: 'src/App.vue',
    titleFrom: 'Vue Vite Tailwind CSS v4',
    titleTo: 'WEB-HMR-VUE-V4',
    classFrom: '<h1 class="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="vue-v4" class="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'vue-v4',
    expectedViteHmrPath: '/src/App.vue',
    styleRequired: false,
    classFlowRequired: false,
  },
  {
    name: 'web vue vite7 Tailwind v4',
    projectDir: 'demo/web/vue-vite7-tailwindcss-v4',
    devCommand: ['exec', 'vite', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
    sourceFile: 'src/App.vue',
    titleFrom: 'Vue Vite 7 Tailwind CSS v4 HMR',
    titleTo: 'WEB-HMR-VUE-VITE7-V4',
    classFrom: '<h1 class="hmr-title m-0 text-xs">',
    classTo: '<h1 data-web-vite-hmr="vue-vite7-v4" class="hmr-title m-0 text-[#ff0000]">',
    markerAttr: 'vue-vite7-v4',
    expectedViteHmrPath: '/src/App.vue',
    styleRequired: false,
    classFlowRequired: false,
  },
  {
    name: 'web nuxt vite Tailwind v4',
    projectDir: 'demo/web/nuxt-vite-tailwindcss-v4',
    devCommand: ['exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', '{port}'],
    sourceFile: 'app/components/site-chrome/SiteBrand.vue',
    titleFrom: 'Nuxt Vite Tailwind CSS v4 HMR',
    titleTo: 'WEB-HMR-NUXT-V4',
    classFrom: '<div class="nav-logo px-1 text-xs">',
    classTo: '<div data-web-vite-hmr="nuxt-v4" class="nav-logo px-1 text-xs">',
    markerAttr: 'nuxt-v4',
    expectedViteHmrPathIncludes: 'SiteBrand.vue',
    sourceUpdateRequired: false,
    classUpdateRequired: false,
    styleRequired: false,
    classFlowRequired: false,
    targetSelector: '.nav-logo',
    titleHmrRetry: true,
  },
  {
    name: 'web nuxt vite Tailwind v4 page background',
    projectDir: 'demo/web/nuxt-vite-tailwindcss-v4',
    devCommand: ['exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', '{port}'],
    sourceFile: 'app/pages/index.vue',
    classFrom: '<main class="min-h-screen bg-white p-6 text-[#111827]">',
    classTo: '<main data-web-vite-hmr="nuxt-page-v4" class="min-h-screen bg-[red] p-6 text-[#111827]">',
    markerAttr: 'nuxt-page-v4',
    expectedViteHmrPathIncludes: 'pages/index.vue',
    reloadAllowed: true,
    styleProperty: 'backgroundColor',
    expectedStyleValue: 'rgb(255, 0, 0)',
    styleRequired: false,
    classFlowRequired: false,
    targetSelector: 'main',
    matrixCoverage: false,
  },
  {
    name: 'web react rsbuild Tailwind v4',
    projectDir: 'demo/web/react-rsbuild-tailwindcss-v4',
    devCommand: ['exec', 'rsbuild', 'dev', '--host', '127.0.0.1', '--port', '{port}'],
    readyLog: /ready\s+built/i,
    styleRequired: false,
    sourceFile: 'src/App.tsx',
    titleFrom: 'React Rsbuild Tailwind CSS v4',
    titleTo: 'WEB-HMR-REACT-RSBUILD-V4',
    classFrom: '<h1 className="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="react-rsbuild-v4" className="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'react-rsbuild-v4',
    classFlowRequired: false,
  },
  {
    name: 'web vue rsbuild Tailwind v4',
    projectDir: 'demo/web/vue-rsbuild-tailwindcss-v4',
    devCommand: ['exec', 'rsbuild', 'dev', '--host', '127.0.0.1', '--port', '{port}'],
    readyLog: /ready\s+built/i,
    styleRequired: false,
    sourceFile: 'src/App.vue',
    titleFrom: 'Vue Rsbuild Tailwind CSS v4',
    titleTo: 'WEB-HMR-VUE-RSBUILD-V4',
    classFrom: '<h1 class="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="vue-rsbuild-v4" class="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'vue-rsbuild-v4',
    classFlowRequired: false,
  },
  {
    name: 'web react webpack Tailwind v4',
    projectDir: 'demo/web/react-webpack-tailwindcss-v4',
    devCommand: ['exec', 'webpack', 'serve', '--mode', 'development', '--host', '127.0.0.1', '--port', '{port}'],
    sourceFile: 'src/App.tsx',
    titleFrom: 'React Webpack Tailwind CSS v4',
    titleTo: 'WEB-HMR-REACT-WEBPACK-V4',
    classFrom: '<h1 className="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="react-webpack-v4" className="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'react-webpack-v4',
    reloadAllowed: true,
    styleRequired: false,
    classFlowRequired: false,
  },
  {
    name: 'web vue webpack Tailwind v4',
    projectDir: 'demo/web/vue-webpack-tailwindcss-v4',
    devCommand: ['exec', 'webpack', 'serve', '--mode', 'development', '--host', '127.0.0.1', '--port', '{port}'],
    sourceFile: 'src/App.vue',
    titleFrom: 'Vue Webpack Tailwind CSS v4',
    titleTo: 'WEB-HMR-VUE-WEBPACK-V4',
    classFrom: '<h1 class="m-0 text-[32px] leading-[38px] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="vue-webpack-v4" class="m-0 text-[#ff0000] leading-[38px] font-semibold">',
    markerAttr: 'vue-webpack-v4',
    styleRequired: false,
    classFlowRequired: false,
  },
]

export const webViteHmrCases = process.env.E2E_WEB_VITE_HMR_CASE
  ? allWebViteHmrCases.filter(item => item.name === process.env.E2E_WEB_VITE_HMR_CASE)
  : allWebViteHmrCases
export const webViteHmrCaseNames = webViteHmrCases.map(item => item.name)
export const webViteHmrCoverageCaseNames = allWebViteHmrCases
  .filter(item => item.matrixCoverage !== false)
  .map(item => item.name)
