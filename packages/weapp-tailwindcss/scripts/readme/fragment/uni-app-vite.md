```js
// vite.config.[jt]s
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss-webpack-plugin/vite'

const vitePlugins = [uni(), uvwt()]

export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  // css: {
  //   postcss: {
  //     plugins: postcssPlugins,
  //   },
  // },
})
```
