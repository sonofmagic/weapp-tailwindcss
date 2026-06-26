import { defineConfig } from "vite";
import { createRequire } from "node:module";
import { dirname } from "node:path";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'

const require = createRequire(import.meta.url);
const uniMpVueRuntimePath = require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js");
const uniMpVueDir = dirname(uniMpVueRuntimePath);

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [
      // 改成 mts，则爆 uni is not a function
      uni(),
      WeappTailwindcss({
        tailwindcssBasedir: process.cwd(),
        cssSourceTrace: true,
        rem2rpx: true,
        generator: {
          webCompat: resolveUniPlatform().isWeb ? true : undefined,
        },
      }),
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
