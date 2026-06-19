# 本机全端测试报告

- generated_at: 2026-06-19T02:12:30.489Z
- repository_root: `/Users/icebreaker/Projects/github/weapp-tailwindcss-codex/tailwindcss-mangle-engine`
- profile: smoke
- steps: 30
- passed: 30
- failed: 0
- skipped: 0
- peak RSS: 4594MB
- max RSS delta: 4032MB

## 命令与内存

| step | status | samples | peak RSS | RSS delta | max process RSS | peak processes | duration | artifacts | command |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| quality | passed | 9 | 1709MB | 0MB | 384MB | 9 | 8s | - | `pnpm build:ci` |
| mini-program-hmr-memory | passed | 55 | 3710MB | 3289MB | 2086MB | 14 | 54s | `e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/weapp-memory/README.md`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/weapp-memory/summary.json`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/weapp-memory/projects/uni-app-vite-tailwindcss-v3.md`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/weapp-memory/projects/uni-app-vite-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/hmr/hmr-full-report-2026-06-19T02-09-23-627Z.json`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/hmr/hmr-full-report-2026-06-19T02-09-23-627Z.md`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/hmr/hmr-full-report-2026-06-19T02-09-57-969Z.json`<br>`e2e/reports/local-full-run/2026-06-19T03-verify-v3-v4-uni-app-platforms/hmr/hmr-full-report-2026-06-19T02-09-57-969Z.md` | `pnpm e2e:demo:weapp-memory --out-dir .tmp/local-full-report-weapp-memory` |
| platform-build-uni-app-vite-tailwindcss-v3-h5 | passed | 8 | 4594MB | 4032MB | 1391MB | 143 | 7s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-h5-ssr | passed | 9 | 4382MB | 3808MB | 1430MB | 144 | 8s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-alipay | passed | 6 | 1465MB | 920MB | 800MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-baidu | passed | 6 | 1430MB | 869MB | 772MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-kuaishou | passed | 6 | 1483MB | 910MB | 810MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-lark | passed | 6 | 1461MB | 901MB | 803MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-qq | passed | 6 | 1446MB | 880MB | 779MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-toutiao | passed | 6 | 1468MB | 904MB | 808MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-mp-weixin | passed | 6 | 1532MB | 965MB | 818MB | 8 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview | passed | 6 | 1443MB | 878MB | 777MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview-huawei | passed | 6 | 1488MB | 918MB | 817MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview-union | passed | 6 | 1438MB | 872MB | 773MB | 7 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-h5 | passed | 6 | 1682MB | 1115MB | 1000MB | 8 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-h5-ssr | passed | 6 | 1682MB | 1118MB | 999MB | 8 | 5s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-alipay | passed | 5 | 1325MB | 759MB | 659MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-baidu | passed | 5 | 1407MB | 846MB | 744MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-jd | passed | 5 | 1399MB | 835MB | 738MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-kuaishou | passed | 5 | 1394MB | 832MB | 728MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-lark | passed | 5 | 1407MB | 849MB | 744MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-qq | passed | 5 | 1398MB | 834MB | 731MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-toutiao | passed | 5 | 1404MB | 839MB | 740MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-weixin | passed | 5 | 1439MB | 872MB | 723MB | 9 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-mp-xhs | passed | 5 | 1399MB | 833MB | 730MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview | passed | 5 | 1404MB | 834MB | 731MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview-huawei | passed | 5 | 1394MB | 857MB | 733MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview-union | passed | 5 | 1397MB | 833MB | 732MB | 8 | 4s | - | `pnpm e2e:multiplatform-build` |
| h5-dev-uni-app-vite-tailwindcss-v3 | passed | 3 | 936MB | 330MB | 329MB | 8 | 2s | - | `pnpm exec vitest run --bail=1 -c ./e2e/vitest.e2e.config.ts e2e/uni-app-vite-tailwindcss-dev-h5.test.ts -t "uni-app vite Tailwind v3"` |
| h5-dev-uni-app-vite-tailwindcss-v4 | passed | 3 | 978MB | 357MB | 355MB | 8 | 2s | - | `pnpm exec vitest run --bail=1 -c ./e2e/vitest.e2e.config.ts e2e/uni-app-vite-tailwindcss-dev-h5.test.ts -t "uni-app vite Tailwind v4"` |

## 全端平台数据

| project | tw | platform | build coverage | build status | build duration | build peak RSS | build RSS delta | build source/note | runtime/HMR coverage | runtime/HMR status | runtime/HMR e2e max | plugin max | runtime/HMR peak RSS | heap peak | runtime/HMR source/note |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| uni-app-vite-tailwindcss-v3 | v3 | app-android | local | local | - | - | - | Android 调试依赖本机 HBuilderX 与 Android 模拟器。 | local | local | - | - | - | - | Android 调试依赖本机 HBuilderX 与 Android 模拟器。 |
| uni-app-vite-tailwindcss-v3 | v3 | app-ios | local | local | - | - | - | iOS 调试依赖 macOS Simulator 与 HBuilderX。 | local | local | - | - | - | - | iOS 调试依赖 macOS Simulator 与 HBuilderX。 |
| uni-app-vite-tailwindcss-v3 | v3 | h5 | automated | passed | 7s | 4594MB | 4032MB | step:platform-build-uni-app-vite-tailwindcss-v3-h5 | automated | passed | 2002ms | - | 936MB | - | step:h5-dev-uni-app-vite-tailwindcss-v3 |
| uni-app-vite-tailwindcss-v3 | v3 | h5:ssr | automated | passed | 8s | 4382MB | 3808MB | step:platform-build-uni-app-vite-tailwindcss-v3-h5-ssr | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-alipay | automated | passed | 5s | 1465MB | 920MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-alipay | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-baidu | automated | passed | 5s | 1430MB | 869MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-baidu | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-kuaishou | automated | passed | 5s | 1483MB | 910MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-kuaishou | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-lark | automated | passed | 5s | 1461MB | 901MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-lark | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-qq | automated | passed | 5s | 1446MB | 880MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-qq | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-toutiao | automated | passed | 5s | 1468MB | 904MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-toutiao | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | mp-weixin | automated | passed | 5s | 1532MB | 965MB | step:platform-build-uni-app-vite-tailwindcss-v3-mp-weixin | automated | passed | 2659ms | 1387ms | 2348MB | 1655MB | e2e/benchmark/e2e-watch-hmr/2026-06-19T02-09-23-629Z-uni-app-vite-tailwindcss-v3.json |
| uni-app-vite-tailwindcss-v3 | v3 | quickapp-webview | automated | passed | 5s | 1443MB | 878MB | step:platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | quickapp-webview-huawei | automated | passed | 5s | 1488MB | 918MB | step:platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview-huawei | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v3 | v3 | quickapp-webview-union | automated | passed | 5s | 1438MB | 872MB | step:platform-build-uni-app-vite-tailwindcss-v3-quickapp-webview-union | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | app-android | local | local | - | - | - | Android 调试依赖本机 HBuilderX 与 Android 模拟器。 | local | local | - | - | - | - | Android 调试依赖本机 HBuilderX 与 Android 模拟器。 |
| uni-app-vite-tailwindcss-v4 | v4 | app-ios | local | local | - | - | - | iOS 调试依赖 macOS Simulator 与 HBuilderX。 | local | local | - | - | - | - | iOS 调试依赖 macOS Simulator 与 HBuilderX。 |
| uni-app-vite-tailwindcss-v4 | v4 | h5 | automated | passed | 5s | 1682MB | 1115MB | step:platform-build-uni-app-vite-tailwindcss-v4-h5 | automated | passed | 2011ms | - | 978MB | - | step:h5-dev-uni-app-vite-tailwindcss-v4 |
| uni-app-vite-tailwindcss-v4 | v4 | h5:ssr | automated | passed | 5s | 1682MB | 1118MB | step:platform-build-uni-app-vite-tailwindcss-v4-h5-ssr | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-alipay | automated | passed | 4s | 1325MB | 759MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-alipay | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-baidu | automated | passed | 4s | 1407MB | 846MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-baidu | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-jd | automated | passed | 4s | 1399MB | 835MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-jd | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-kuaishou | automated | passed | 4s | 1394MB | 832MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-kuaishou | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-lark | automated | passed | 4s | 1407MB | 849MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-lark | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-qq | automated | passed | 4s | 1398MB | 834MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-qq | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-toutiao | automated | passed | 4s | 1404MB | 839MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-toutiao | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | mp-weixin | automated | passed | 4s | 1439MB | 872MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-weixin | automated | passed | 1050ms | 335ms | 1072MB | 530MB | e2e/benchmark/e2e-watch-hmr/2026-06-19T02-09-57-972Z-uni-app-vite-tailwindcss-v4.json |
| uni-app-vite-tailwindcss-v4 | v4 | mp-xhs | automated | passed | 4s | 1399MB | 833MB | step:platform-build-uni-app-vite-tailwindcss-v4-mp-xhs | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | quickapp-webview | automated | passed | 4s | 1404MB | 834MB | step:platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | quickapp-webview-huawei | automated | passed | 4s | 1394MB | 857MB | step:platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview-huawei | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |
| uni-app-vite-tailwindcss-v4 | v4 | quickapp-webview-union | automated | passed | 4s | 1397MB | 833MB | step:platform-build-uni-app-vite-tailwindcss-v4-quickapp-webview-union | exempt | exempt | - | - | - | - | 该平台当前只做构建产物验证，没有登记真实运行态 HMR 命令。 |

## 口径

- 该报告统计本机命令进程树 RSS，不包含已在命令外常驻的 IDE/模拟器进程。
- 全端平台数据来自覆盖矩阵、weapp memory summary、HMR full report 与本脚本的 per-platform build step；没有实测的 local/optional 平台会保留为 local/not-run/exempt。
- runtime/HMR 列既承载真实端到端 HMR 数据，也承载 H5 dev CSS 运行态验证数据；source/note 会标明具体来源。
- HMR 细分耗时请看同目录下复制或生成的 HMR report；端到端 HMR、H5 dev 运行态耗时与插件处理耗时是不同口径。
- optional step 失败会保留在报告中，便于说明本机缺少 SDK/设备/IDE 时的覆盖边界。

