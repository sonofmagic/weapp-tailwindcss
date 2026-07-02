import { defineConfig } from "vite";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'

const require = createRequire(import.meta.url);
const projectRoot = dirname(fileURLToPath(import.meta.url));
const uniMpVueRuntimePath = require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js");
const uniMpVueDir = dirname(uniMpVueRuntimePath);

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const uniPlatform = resolveUniPlatform()
  return {
    plugins: [
      // 改成 mts，则爆 uni is not a function
      uni(),
      WeappTailwindcss({
        appType: 'uni-app-vite',
        tailwindcssBasedir: projectRoot,
        cssEntries: [
          resolve(projectRoot, 'src/main.css'),
          resolve(projectRoot, 'src/sub-normal/pages/index.css'),
          resolve(projectRoot, 'src/sub-independent/pages/index.css'),
        ],
        cssSourceTrace: true,
        rem2rpx: true,
        styleInjector: false,
        generator: {
          webCompat: uniPlatform.isWeb ? true : undefined,
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
