import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite';
import { StyleInjector } from 'weapp-style-injector/vite/uni-app';

type WeappTwUpdateKind = 'wxss' | 'wxml' | 'js' | 'other';

const DEFAULT_UPDATE_LOG_LIMIT = 20;
const parsedUpdateLogLimit = Number(process.env.WEAPP_TW_UPDATE_LOG_LIMIT);
const WEAPP_TW_UPDATE_LOG_LIMIT = Number.isFinite(parsedUpdateLogLimit)
  ? Math.max(0, parsedUpdateLogLimit)
  : DEFAULT_UPDATE_LOG_LIMIT;
const WEAPP_TW_VERBOSE_UPDATE = process.env.WEAPP_TW_VERBOSE_UPDATE === '1';

const weappTwUpdateByKind: Record<WeappTwUpdateKind, number> = {
  wxss: 0,
  wxml: 0,
  js: 0,
  other: 0,
};

function resetWeappTwUpdateByKind() {
  weappTwUpdateByKind.wxss = 0;
  weappTwUpdateByKind.wxml = 0;
  weappTwUpdateByKind.js = 0;
  weappTwUpdateByKind.other = 0;
}

function resolveWeappTwUpdateKind(filename: string): WeappTwUpdateKind {
  if (/\.(?:wx|ac|jx|tt|q|c|ty)ss$/i.test(filename)) {
    return 'wxss';
  }
  if (/\.(?:(?:wx|ax|jx|ks|tt|q|ty|xhs)ml|swan)$/i.test(filename)) {
    return 'wxml';
  }
  if (/\.[cm]?js$/i.test(filename)) {
    return 'js';
  }
  return 'other';
}

const bench =
  process.env.WEAPP_TW_ENABLE_BENCH === '1'
    ? require('../bench.cjs')('uni-app-vite-vue3')
    : {
        start() {},
        end() {},
        dump() {},
      };


// 注意： 打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === 'h5';
const isApp = process.env.UNI_PLATFORM === 'app-plus';
const WeappTailwindcssDisabled = isH5 || isApp;
// vite 插件配置
const vitePlugins = [uni()]; // Unocss()
// postcss 插件配置
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()];

// const postcssPlugins = [require('postcss-windicss')()];

// const postcssPlugins = [];
if (!WeappTailwindcssDisabled) {
  // postcssPlugins.push(
  //   require('postcss-rem-to-responsive-pixel')({
  //     rootValue: 32,
  //     propList: ['*'],
  //     transformUnit: 'rpx',
  //   }),
  // );
  postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'));
}
let weappTwLoadTime = 0;
let weappTwStartTime = 0;
let weappTwUpdateCount = 0;
let weappTwLoggedUpdateCount = 0;
// https://vitejs.dev/config/
export default defineConfig(async () => {
  // const { default: Inspect } = await import('vite-plugin-inspect');
  return {
    plugins: [
      uni(),
      UnifiedViteWeappTailwindcssPlugin({
        px2rpx: true,
        wxsMatcher() {
          return false;
        },
        inlineWxs: true,
        // jsEscapeStrategy: 'replace', // 'regenerate'
        onLoad() {
          weappTwLoadTime = performance.now();
          console.info('[weapp-tw] onLoad', new Date().toISOString());
        },
        onStart() {
          bench.start();
          weappTwStartTime = performance.now();
          weappTwUpdateCount = 0;
          weappTwLoggedUpdateCount = 0;
          resetWeappTwUpdateByKind();
          console.info('[weapp-tw] onStart', new Date().toISOString());
        },
        onUpdate(filename: string, oldVal: string, newVal: string) {
          if (oldVal === newVal) {
            return;
          }
          weappTwUpdateCount += 1;
          const kind = resolveWeappTwUpdateKind(filename);
          weappTwUpdateByKind[kind] += 1;

          if (!WEAPP_TW_VERBOSE_UPDATE || weappTwLoggedUpdateCount >= WEAPP_TW_UPDATE_LOG_LIMIT) {
            return;
          }

          weappTwLoggedUpdateCount += 1;
          const elapsed = (performance.now() - weappTwStartTime).toFixed(0);
          console.info(`[weapp-tw] onUpdate #${weappTwUpdateCount} ${filename} (+${elapsed}ms)`);

          if (weappTwLoggedUpdateCount === WEAPP_TW_UPDATE_LOG_LIMIT) {
            console.info(`[weapp-tw] onUpdate log limit reached: ${WEAPP_TW_UPDATE_LOG_LIMIT}`);
          }
        },
        onEnd() {
          bench.end();
          bench.dump();
          const loadDuration = weappTwLoadTime > 0
            ? (performance.now() - weappTwLoadTime).toFixed(0)
            : '-';
          const startDuration = weappTwStartTime > 0
            ? (performance.now() - weappTwStartTime).toFixed(0)
            : '-';
          const omitted = Math.max(0, weappTwUpdateCount - weappTwLoggedUpdateCount);
          const suffix = omitted > 0 ? `, 已省略日志: ${omitted}` : '';

          console.info(
            `[weapp-tw] onEnd | 自 onLoad 耗时: ${loadDuration}ms, 自 onStart 耗时: ${startDuration}ms, 修改文件数: ${weappTwUpdateCount}, 分类: wxss=${weappTwUpdateByKind.wxss}, wxml=${weappTwUpdateByKind.wxml}, js=${weappTwUpdateByKind.js}, other=${weappTwUpdateByKind.other}${suffix}`
          );
        },
        rem2rpx: true,
        // cssSelectorReplacement: {
        //   universal: ['view', 'text', 'button'],
        // },
        disabled: WeappTailwindcssDisabled,
        // customReplaceDictionary: {
        //   '[': '_',
        //   ']': '_',
        //   '(': '_',
        //   ')': '-',
        // },
      }),
      // StyleInjector(),
      // Inspect({
      //   build: true,
      //   outputDir: '.vite-inspect'
      // })
      // {
      //   name: 'x',
      //   transform(code, id) {
      //     if (id.includes('node_modules')) {

      //     } else {
      //       console.log(code, id)
      //     }

      //     // return code
      //   }
      // }
    ],
    resolve: {
      alias: {
        path: 'path-browserify',
        'entities/decode': 'entities/lib/decode.js',
        url: 'node:url',
      },
    },
    optimizeDeps: {
      include: ['path-browserify', 'entities/lib/decode.js'],
    },
    // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
    css: {
      postcss: {
        plugins: postcssPlugins,
      },
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api', 'import'],
        },
      }
    },

    build: {
      minify: false,
      sourcemap: true,
    },
  }
});
