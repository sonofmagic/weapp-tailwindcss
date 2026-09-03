import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { themeUtsPlugin } from './scripts/theme-plugin.mjs'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const mainCss = resolve(projectRoot, 'main.css')
const uni = (uniModule as typeof uniModule & { default?: typeof uniModule }).default ?? uniModule

export default defineConfig({
	plugins: [
		uni(),
		WeappTailwindcss(
			uniAppX({
				base: projectRoot,
				cssEntries: [mainCss],
				rem2rpx: true
			})
		),
		themeUtsPlugin(mainCss, resolve(projectRoot, 'theme.uts'))
	]
})
