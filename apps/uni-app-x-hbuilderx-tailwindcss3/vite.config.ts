import uni from '@dcloudio/vite-plugin-uni'
import { debugX } from '@weapp-tailwindcss/debug-uni-app-x'
import tailwindcss from 'tailwindcss'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { r } from './shared'

export default () => {
  const uniUtsPlatform = process.env.UNI_UTS_PLATFORM
  const shouldEnableWeappTailwindcss = uniUtsPlatform !== 'app-ios' && uniUtsPlatform !== 'app-android'
  const extraPlugins = []

  if (shouldEnableWeappTailwindcss) {
    extraPlugins.push(
      UnifiedViteWeappTailwindcssPlugin(
        uniAppX({
          base: __dirname,
          rem2rpx: true,
          resolve: {
            paths: [import.meta.url],
          },
        }),
      ),
    )
  }

  return {
    plugins: [
      uni(),
      ...extraPlugins,
      debugX({
        cwd: __dirname,
      }),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: r('./tailwind.config.js'),
          }),
        ],
      },
    },
  }
}
