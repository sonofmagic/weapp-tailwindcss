import evidenceJson from './generated/evidence.json'

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1800,
} as const

export const COLORS = {
  background: '#0b0f10',
  surface: '#121819',
  surfaceRaised: '#182022',
  border: '#2a3538',
  text: '#edf4f1',
  muted: '#91a0a5',
  green: '#07c160',
  blue: '#0ea5e9',
} as const

export const DOCS_URL = 'https://tw.icebreaker.top/zh-cn/docs/quick-start/frameworks/lynx'

export const scenes = [
  { id: 'hook', from: 0, duration: 150, subtitle: '在 Lynx 里，也可以直接写 Tailwind CSS。' },
  { id: 'config', from: 150, duration: 240, subtitle: '@weapp-tailwindcss/lynx，把 Tailwind CSS 4 接入 ReactLynx 和 Rspeedy。' },
  { id: 'classname', from: 390, duration: 330, subtitle: '保留原生 className，不需要运行时样式表，也不改写 JSX。' },
  { id: 'pipeline', from: 720, duration: 330, subtitle: '样式在构建阶段生成普通 CSS，进入 Lynx 原生 bundle。' },
  { id: 'native', from: 1050, duration: 360, subtitle: '同一套组件代码，在 iOS 和 Android 上真实运行。' },
  { id: 'evidence', from: 1410, duration: 270, subtitle: '从生成、编码到双端运行，支持边界都有真实证据。' },
  { id: 'cta', from: 1680, duration: 120, subtitle: '打开 Lynx 接入文档，开始构建。' },
] as const

export type SceneId = typeof scenes[number]['id']

export interface EvidenceSummary {
  total: number
  supported: number
  unsupported: number
  platformDifferences: number
  verifiedAt: string
  versions: {
    tailwindcss: string
    lynxEngine: string
  }
}

export interface LynxPromoProps extends Record<string, unknown> {
  title: string
  packageName: string
  docsUrl: string
  accentGreen: string
  accentBlue: string
  evidence: EvidenceSummary
}

export const defaultPromoProps: LynxPromoProps = {
  title: 'Tailwind CSS 4，进入 Lynx 原生应用',
  packageName: '@weapp-tailwindcss/lynx',
  docsUrl: DOCS_URL,
  accentGreen: COLORS.green,
  accentBlue: COLORS.blue,
  evidence: evidenceJson,
}

export function sceneAtFrame(frame: number) {
  return scenes.find(scene => frame >= scene.from && frame < scene.from + scene.duration)
}
