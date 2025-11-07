import { defineConfig } from "vite";
import { createRequire } from "node:module";
import path, { dirname } from "node:path";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { StyleInjector } from 'weapp-style-injector/vite/uni-app'
// import tailwindcss from '@tailwindcss/vite'

const require = createRequire(import.meta.url);
const uniMpVueRuntimePath = require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js");
const uniMpVueDir = dirname(uniMpVueRuntimePath);

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
      UnifiedViteWeappTailwindcssPlugin({
        rem2rpx: true,
        cssEntries: [
          path.resolve(__dirname, "src/main.css"),
          path.resolve(__dirname, "src/common.css"),
        ],
      }),
      // StyleInjector(),
    ],
    resolve: {
      alias: {
        // Force uni-app runtime to use the v3 build that still exports findComponentPropsData
        "@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js": uniMpVueRuntimePath,
        "@dcloudio/uni-mp-vue": uniMpVueDir,
      }
    },
  }
});
