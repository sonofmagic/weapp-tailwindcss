import { defineConfig } from "vite";
import { createRequire } from "node:module";
import path, { dirname } from "node:path";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

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
        rem2rpx: true,
        cssEntries: [
          path.resolve(__dirname, "src/main.css"),
          path.resolve(__dirname, "src/common.css"),
          path.resolve(__dirname, "src/pages-order/index.css"),
        ],
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
