export interface WebViteHmrCase {
  name: string
  projectDir: string
  sourceFile: string
  titleFrom: string
  titleTo: string
  classFrom: string
  classTo: string
  markerAttr: string
}

export const webViteHmrCases: WebViteHmrCase[] = [
  {
    name: 'web react vite Tailwind v4',
    projectDir: 'demo/web/react-vite-tailwindcss-v4',
    sourceFile: 'src/main.tsx',
    titleFrom: 'React Vite Tailwind CSS v4',
    titleTo: 'WEB-HMR-REACT-V4',
    classFrom: '<h1 className="text-[32rpx] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="react-v4" className="text-[red] font-semibold">',
    markerAttr: 'react-v4',
  },
  {
    name: 'web vue vite Tailwind v4',
    projectDir: 'demo/web/vue-vite-tailwindcss-v4',
    sourceFile: 'src/App.vue',
    titleFrom: 'Vue Vite Tailwind CSS v4',
    titleTo: 'WEB-HMR-VUE-V4',
    classFrom: '<h1 class="text-[32rpx] font-semibold">',
    classTo: '<h1 data-web-vite-hmr="vue-v4" class="text-[red] font-semibold">',
    markerAttr: 'vue-v4',
  },
]

export const webViteHmrCaseNames = webViteHmrCases.map(item => item.name)
