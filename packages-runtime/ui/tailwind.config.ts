import type { Config } from 'tailwindcss'
import { weappTailwindcssUIPreset } from './src/preset.ts'

const config = {
  content: [
    './src/**/*.{ts,js,jsx,tsx,css}',
    './test/**/*.{ts,js,jsx,tsx}',
  ],
  presets: [weappTailwindcssUIPreset as unknown as Config],
} satisfies Config

export default config
