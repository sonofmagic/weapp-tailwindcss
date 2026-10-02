export const FPS = 30
export const DOCS_URL = 'https://tw.weapp.dev'
export const FORMATS = ['landscape', 'portrait'] as const
export type Format = typeof FORMATS[number]
export type SceneId = 'intro' | 'craft' | 'pipeline' | 'platforms' | 'ecosystem' | 'promise' | 'cta'

export interface Scene {
  id: SceneId
  from: number
  duration: number
  narration: string
  spoken?: string
  offset: number
}

export interface Film {
  id: string
  width: number
  height: number
  seconds: number
  scenes: Scene[]
}

export const films: Record<Format, Film> = {
  landscape: {
    id: 'WeappPromoLandscape',
    width: 1920,
    height: 1080,
    seconds: 60,
    scenes: [
      { id: 'intro', from: 0, duration: 4, offset: 0.35, narration: 'Tailwind CSS，走向全端。' },
      { id: 'craft', from: 4, duration: 8, offset: 0.6, narration: '从熟悉的 class 开始，让间距、色彩和圆角，组成你想要的界面。' },
      { id: 'pipeline', from: 12, duration: 10, offset: 0.65, narration: '同一套 Tailwind 输入，面向不同目标输出。让样式，连接更多可能。' },
      { id: 'platforms', from: 22, duration: 14, offset: 0.8, narration: '从 Web、小程序、App WebView，到 uni-app x、React Native 和 Lynx。熟悉的开发体验，走向更多屏幕。', spoken: '从 Web、小程序、App Web View，到 uni app x、React Native 和 Lynx。熟悉的开发体验，走向更多屏幕。' },
      { id: 'ecosystem', from: 36, duration: 12, offset: 0.65, narration: 'Tailwind CSS 4，接入你熟悉的开发生态。和 uni-app、Taro、Mpx、weapp-vite 一起，把想法变成作品。', spoken: 'Tailwind CSS 四，接入你熟悉的开发生态。和 uni app、Taro、M P X、weapp vite 一起，把想法变成作品。' },
      { id: 'promise', from: 48, duration: 6, offset: 0.5, narration: '把熟悉的原子化开发体验，带到更多屏幕。' },
      { id: 'cta', from: 54, duration: 6, offset: 0.5, narration: 'weapp-tailwindcss。打开官网，开始构建。', spoken: 'weapp Tailwind CSS。打开官网，开始构建。' },
    ],
  },
  portrait: {
    id: 'WeappPromoPortrait',
    width: 1080,
    height: 1920,
    seconds: 30,
    scenes: [
      { id: 'intro', from: 0, duration: 3, offset: 0.15, narration: 'Tailwind，走向全端。' },
      { id: 'craft', from: 3, duration: 7, offset: 0.35, narration: '从熟悉的 class 开始，把间距、色彩和圆角，变成你想要的界面。' },
      { id: 'platforms', from: 10, duration: 10, offset: 0.35, narration: '从 Web、小程序，到原生跨端生态。同一套 Tailwind 输入，面向不同目标输出。' },
      { id: 'ecosystem', from: 20, duration: 6, offset: 0.35, narration: 'Tailwind CSS 4，连接生态，跨越屏幕。', spoken: 'Tailwind CSS 四，连接生态，跨越屏幕。' },
      { id: 'cta', from: 26, duration: 4, offset: 0.2, narration: 'weapp-tailwindcss。开始构建。', spoken: 'weapp Tailwind CSS。开始构建。' },
    ],
  },
}

export const C = {
  background: '#040D1A',
  surface: '#0A1B2B',
  blue: '#0EA5E9',
  green: '#07C160',
  ice: '#B6EBFF',
  text: '#F0F7FF',
  muted: '#91AABE',
  line: '#224052',
} as const

export function getFormat(value: string | undefined): Format {
  if (value === 'landscape' || value === 'portrait') {
    return value
  }
  throw new Error(`未知画幅：${value}`)
}

export function sceneAtFrame(format: Format, frame: number) {
  return films[format].scenes.find(scene => frame >= scene.from * FPS && frame < (scene.from + scene.duration) * FPS)
}
