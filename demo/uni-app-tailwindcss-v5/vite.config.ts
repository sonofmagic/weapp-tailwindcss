import { defineConfig } from "vite";
import { createRequire } from "node:module";
import path, { dirname } from "node:path";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { StyleInjector } from 'weapp-style-injector/vite/uni-app'
import { resolveDemoGeneratorMode } from '../shared/weapp-tailwind-generator-mode'
// import tailwindcss from '@tailwindcss/vite'

const require = createRequire(import.meta.url);
const uniMpVueRuntimePath = require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js");
const uniMpVueDir = dirname(uniMpVueRuntimePath);
const isGeneratorMode = process.env.WEAPP_TW_GENERATOR_MODE !== 'legacy'
const generator = resolveDemoGeneratorMode({
  mode: 'force',
  target: 'weapp',
});

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const tailwindcss = isGeneratorMode
    ? undefined
    : (await import('@tailwindcss/vite')).default
  return {
    plugins: [
      // 改成 mts，则爆 uni is not a function
      uni(),
      // 以默认的 cjs 方式加载，报错
      // Failed to resolve "@tailwindcss/vite". This package is ESM only but it was tried to load by `require`
      ...(tailwindcss ? [tailwindcss()] : []),
      UnifiedViteWeappTailwindcssPlugin({
        rem2rpx: true,
        generator,
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
