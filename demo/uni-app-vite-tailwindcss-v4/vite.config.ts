import { defineConfig, type Plugin } from "vite";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// dynamic require of is not supported
// const uni = require("@dcloudio/vite-plugin-uni");
import uni from "@dcloudio/vite-plugin-uni";
import parity from '../official-postcss-parity-plugin.cjs'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { resolveUniPlatform } from 'weapp-tailwindcss/framework'

const require = createRequire(import.meta.url);
const projectRoot = dirname(fileURLToPath(import.meta.url));
const uniMpVueRuntimePath = require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js");
const uniMpVueDir = dirname(uniMpVueRuntimePath);
const officialPostcssParity = process.env.WEAPP_TW_OFFICIAL_POSTCSS_PARITY === '1'
const issue1005FinalCssFixture: Plugin = {
  name: 'issue-1005-final-css-fixture',
  enforce: 'post' as const,
  generateBundle(_options, bundle) {
    for (const output of Object.values(bundle)) {
      if (output.type !== 'asset' || !/\.(?:acss|css|jxss|qss|ttss|wxss)$/i.test(output.fileName)) {
        continue
      }
      output.source = `${String(output.source)}\n@media (prefers-color-scheme: light) {}`
    }
  },
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const uniPlatform = resolveUniPlatform()
  const webCompat = uniPlatform.isWeb
    ? process.env.WEAPP_TW_WEB_COMPAT !== '0'
    : undefined
  return {
    plugins: [
      // 改成 mts，则爆 uni is not a function
      uni(),
      ...(uniPlatform.isMp ? [issue1005FinalCssFixture] : []),
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
        customAttributes: {
          '*': [/^t-class(?:-.+)?$/],
        },
        postcssOptions: parity.createOfficialPostcssParityPostcssOptions(),
        generator: officialPostcssParity
          ? false
          : {
              webCompat,
            },
      }),
    ],
    css: {
      postcss: {
        plugins: [],
      },
    },
    resolve: {
      alias: {
        // Force uni-app runtime to use the v3 build that still exports findComponentPropsData
        "@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js": uniMpVueRuntimePath,
        "@dcloudio/uni-mp-vue": uniMpVueDir,
      }
    },
  }
});
