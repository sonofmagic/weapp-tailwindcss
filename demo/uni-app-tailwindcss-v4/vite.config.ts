import { defineConfig } from "vite";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
// import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  return {
    plugins: [
      // 改成 mts，则爆 uni is not a function
      uni(),
      // 以默认的 cjs 方式加载，报错
      // Failed to resolve "@tailwindcss/vite". This package is ESM only but it was tried to load by `require`
      tailwindcss(),
      UnifiedViteWeappTailwindcssPlugin(
        {
          rem2rpx: true
        }
      )
    ],
  }
});
