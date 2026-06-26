# demo full platform validation report

Generated at: 2026-06-26T08:40:00Z
Repository: `/Users/icebreaker/Projects/github/weapp-tailwindcss`
HEAD: `1e6dc707b14d1bc2403e26fad5f0920625ba04ac`
Node: `v24.14.1`; pnpm: `11.8.0`

## Scope

This report covers the non-`demo/web` demo projects requested in this run:

- `mpx-tailwindcss-v4`
- `taro-vite-react-tailwindcss-v4`
- `taro-vite-vue3-tailwindcss-v4`
- `taro-webpack-react-tailwindcss-v4`
- `taro-webpack-vue3-tailwindcss-v4`
- `uni-app-vite-tailwindcss-v4`
- `uni-app-vite-vue3-hbuilderx-tailwindcss-v4`
- `uni-app-x-hbuilderx-tailwindcss-v4`
- `weapp-vite-tailwindcss-v4`

The separate `demo/web` React/Vue x Vite/Rsbuild/Webpack report is committed under `demo/web/report/web-full-report/2026-06-26T08-06-32-105Z/`.

## Result Summary

| Area | Result | Notes |
| --- | --- | --- |
| mpx mini-program builds | passed | wx, ali, swan, tt, dd output checks passed. |
| mpx mini-program HMR | passed | content/template/script/style and subpackage checks passed. |
| Taro mini-program builds | passed | Additional alipay/tt checks for Vite demos and alipay check for webpack React passed. |
| Taro H5 builds | passed | Vite/webpack React/Vue3 H5 build checks passed. |
| Taro H5 HMR | passed | Vite/webpack React/Vue3 browser HMR checks passed. |
| Taro mini-program HMR | passed | `taro-webpack-react-tailwindcss-v4` mini-program + web HMR checks passed. |
| uni-app multi-platform builds | passed | mp-* / h5 / h5:ssr / quickapp variants passed for Vite uni-app. |
| uni-app H5 CSS | passed | H5 dev CSS verification passed. |
| uni-app mini-program + H5 HMR | passed | mp-weixin, H5, and subpackage checks passed. |
| uni-app HBuilderX Vue3 mp-weixin build | passed | mp-weixin build output check passed. |
| uni-app x HMR | environment blocked | HBuilderX CLI was not available in this local environment. |
| weapp-vite build | passed | Weapp build output covered by build/HMR prebuild checks. |
| weapp-vite HMR | passed | Template/script/style/content and subpackage checks passed. |

## Build And Output Checks

| Command | Result | Coverage |
| --- | --- | --- |
| `E2E_MULTIPLATFORM_BUILD_STATUS=all E2E_MULTIPLATFORM_BUILD_CASE='mpx-tailwindcss-v4\|uni-app-vite-tailwindcss-v4\|uni-app-vite-vue3-hbuilderx-tailwindcss-v4 mp-weixin\|taro-vite-react-tailwindcss-v4 (alipay\|tt)\|taro-vite-vue3-tailwindcss-v4 (alipay\|tt)\|taro-webpack-react-tailwindcss-v4 alipay' pnpm e2e:multiplatform-build` | passed, 28 tests, 119.47s | mpx wx/ali/swan/tt/dd; uni-app mp-alipay/mp-baidu/mp-jd/mp-kuaishou/mp-lark/mp-qq/mp-toutiao/mp-weixin/mp-xhs/h5/h5:ssr/quickapp-webview/quickapp-webview-huawei/quickapp-webview-union; HBuilderX Vue3 mp-weixin; Taro selected non-weapp targets. |
| `pnpm e2e:taro:h5-build` | passed, 5 tests, 67.83s | Taro Vite React, Vite Vue3, Webpack React, Webpack Vue3 H5 builds. |
| `pnpm exec vitest run --bail=1 -c ./e2e/vitest.e2e.config.ts e2e/uni-app-vite-tailwindcss-dev-h5.test.ts -t "uni-app vite Tailwind v4"` | passed, 2 tests, 3.92s | uni-app Vite H5 dev CSS generation. |

## HMR Results

| Project | Result | content | template | script | style | web | subpackage |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `mpx-tailwindcss-v4` | passed | 1427ms | 1906ms | 1594ms | 1374ms | n/a | 2 |
| `taro-webpack-react-tailwindcss-v4` | passed | 8085ms | 11640ms | 8088ms | 8086ms | 1382ms | 2 |
| `uni-app-vite-tailwindcss-v4` | passed | 592ms | 766ms | 641ms | 1410ms | 289ms | 2 |
| `weapp-vite-tailwindcss-v4` | passed | 256ms | 297ms | 295ms | 249ms | n/a | 2 |
| `uni-app-x-hbuilderx-tailwindcss-v4` | environment blocked | n/a | n/a | n/a | n/a | n/a | n/a |

HMR commands:

- `E2E_HOT_UPDATE_CASE_NAME=mpx-tailwindcss-v4 pnpm e2e:hot-update:demo`
- `E2E_HOT_UPDATE_CASE_NAME=taro-webpack-react-tailwindcss-v4 pnpm e2e:hot-update:demo`
- `E2E_HOT_UPDATE_CASE_NAME=uni-app-vite-tailwindcss-v4 pnpm e2e:hot-update:demo`
- `E2E_HOT_UPDATE_CASE_NAME=weapp-vite-tailwindcss-v4 pnpm e2e:hot-update:demo`
- `E2E_WATCH_CASE=uni-app-x-hbuilderx-tailwindcss-v4 pnpm e2e:watch`

Taro H5 browser HMR also passed with `pnpm e2e:taro:web-hmr`:

| Project | HMR |
| --- | ---: |
| `taro-vite-react-tailwindcss-v4` | 8020ms |
| `taro-vite-vue3-tailwindcss-v4` | 3815ms |
| `taro-webpack-react-tailwindcss-v4` | 9818ms |
| `taro-webpack-vue3-tailwindcss-v4` | 10930ms |

## uni-app x Environment Blocker

`uni-app-x-hbuilderx-tailwindcss-v4` is a local-only HBuilderX watch case. The command was executed and failed before project validation because HBuilderX CLI could not be resolved:

```text
未找到 HBuilderX:
1. 未检测到正在运行的 HBuilderX 进程
2. HBUILDERX_CLI_PATH 环境变量未设置或路径无效
```

This is recorded as an environment blocker for the current machine, not as a demo output failure. To run this case, start HBuilderX or set `HBUILDERX_CLI_PATH`, then rerun:

```sh
E2E_WATCH_CASE=uni-app-x-hbuilderx-tailwindcss-v4 pnpm e2e:watch
```

## Artifacts

- Web full report: `demo/web/report/web-full-report/2026-06-26T08-06-32-105Z/README.md`
- Web full structured report: `demo/web/report/web-full-report/2026-06-26T08-06-32-105Z/report.json`
- Web screenshots: `demo/web/report/web-full-report/2026-06-26T08-06-32-105Z/compare/`
- This report JSON: `demo/report/full-platform-report/2026-06-26T08-40-00Z/report.json`

Raw HMR benchmark JSON files were generated under `e2e/benchmark/e2e-watch-hmr/`, which is ignored by the repository. The key metrics are copied into this committed report.

## Final Git Status

After validation, the demo source files modified by HMR tests were restored. The remaining pre-existing workspace state was:

```text
 M submodules/tailwindcss-v4
?? submodules/tailwindcss-v3/
```

