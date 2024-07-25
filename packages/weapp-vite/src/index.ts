import type { Plugin } from 'vite'
// import { transformWithEsbuild } from 'vite'

export default function vitePluginWeapp(): Plugin[] {
  return [
    {
      name: 'vite-plugin-weapp',
      configResolved(config) {
        config.server.open ||= false
        config.server.watch ||= {

        }
      },
    },
  ]
}
