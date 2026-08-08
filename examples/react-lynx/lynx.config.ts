import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginLynxTailwindcss } from '@weapp-tailwindcss/lynx'

export default defineConfig({
  output: {
    assetPrefix: '/',
    distPath: {
      root: 'dist',
      intermediate: 'dist/.rspeedy',
    },
  },
  plugins: [pluginReactLynx(), pluginLynxTailwindcss()],
})
