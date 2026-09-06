import { realpathSync } from 'node:fs'
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
	server: { host: '127.0.0.1' },
	plugins: [
		{
			name: 'issue-1144-server-identity',
			configureServer(server) {
				server.middlewares.use('/__issue1144_identity', (_request, response) => {
					response.setHeader('Content-Type', 'application/json')
					response.end(JSON.stringify({ root: realpathSync(projectRoot) }))
				})
			}
		},
		uni(),
		WeappTailwindcss(
			uniAppX({
				base: projectRoot,
				cssEntries: [mainCss],
				customAttributes: {
					'*': ['pt']
				},
				rem2rpx: true
			})
		),
		themeUtsPlugin(mainCss, resolve(projectRoot, 'theme.uts'))
	]
})
