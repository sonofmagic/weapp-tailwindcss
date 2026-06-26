# demo/web full validation report

Generated at: 2026-06-26T07:18:11.922Z
Repository: /Users/icebreaker/Projects/github/weapp-tailwindcss
HEAD: `6937777a052cba6b4a79518d35d222b72703db39`
Node: `v24.14.1`; pnpm: `11.8.0`

## Git status

```text
## main...origin/main
 M demo/web/README.md
 M demo/web/react-rsbuild-tailwindcss-v4/src/main.tsx
 M demo/web/react-rsbuild-tailwindcss-v4/src/style.css
 M demo/web/react-vite-tailwindcss-v4/src/main.tsx
 M demo/web/react-webpack-tailwindcss-v4/src/main.tsx
 M demo/web/scripts/compare-dev-weapp.mjs
 M demo/web/shared/webpack-plugin-target.mjs
 M demo/web/style-output-report.md
 M demo/web/vue-rsbuild-tailwindcss-v4/src/App.vue
 M demo/web/vue-rsbuild-tailwindcss-v4/src/style.css
 M demo/web/vue-vite-tailwindcss-v4/src/App.vue
 M demo/web/vue-webpack-tailwindcss-v4/src/App.vue
 M e2e/web-css-preservation.test.ts
 M e2e/web-vite-demo-hmr-cases.ts
 M package.json
 M packages/weapp-tailwindcss/src/bundlers/vite/index.ts
 M packages/weapp-tailwindcss/test/bundlers/vite-plugin.bundle.unit.test.ts
 M submodules/tailwindcss-v4
?? demo/web/report/
?? packages/weapp-tailwindcss/src/bundlers/vite/serve-js-transform.ts
?? packages/weapp-tailwindcss/test/bundlers/vite-serve-js-transform.unit.test.ts
?? scripts/web-full-report.mjs
?? scripts/web-full-report/
?? submodules/tailwindcss-v3/
```

Note: existing submodule status is treated as pre-existing workspace state and is not included in pass/fail conclusions.

## Overview

| Project | build:web | build:weapp | web render | parity | HMR | web size | weapp size | weapp CSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| react-vite-tailwindcss-v4 | passed 744ms | passed 947ms | passed | passed | passed 249ms | 198.0 KiB | 199.8 KiB | passed |
| vue-vite-tailwindcss-v4 | passed 743ms | passed 904ms | passed | passed | passed 214ms | 69.7 KiB | 71.4 KiB | passed |
| react-rsbuild-tailwindcss-v4 | passed 709ms | passed 966ms | passed | passed | passed 182ms | 577.6 KiB | 579.4 KiB | passed |
| vue-rsbuild-tailwindcss-v4 | passed 743ms | passed 972ms | passed | passed | passed 112ms | 389.2 KiB | 391.0 KiB | passed |
| react-webpack-tailwindcss-v4 | passed 1195ms | passed 1327ms | passed | passed | passed 259ms | 574.8 KiB | 576.2 KiB | passed |
| vue-webpack-tailwindcss-v4 | passed 1203ms | passed 1358ms | passed | passed | passed 227ms | 384.9 KiB | 386.3 KiB | passed |

## Build artifacts

| Project | Target | Output | Files | Total | Gzip total | CSS files | CSS total |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| react-vite-tailwindcss-v4 | web | `demo/web/react-vite-tailwindcss-v4/dist` | 3 | 198.0 KiB | 61.6 KiB | 1 | 8.8 KiB |
| react-vite-tailwindcss-v4 | weapp | `demo/web/react-vite-tailwindcss-v4/dist-weapp` | 3 | 199.8 KiB | 61.6 KiB | 1 | 10.5 KiB |
| vue-vite-tailwindcss-v4 | web | `demo/web/vue-vite-tailwindcss-v4/dist` | 3 | 69.7 KiB | 26.3 KiB | 1 | 8.8 KiB |
| vue-vite-tailwindcss-v4 | weapp | `demo/web/vue-vite-tailwindcss-v4/dist-weapp` | 3 | 71.4 KiB | 26.3 KiB | 1 | 10.4 KiB |
| react-rsbuild-tailwindcss-v4 | web | `demo/web/react-rsbuild-tailwindcss-v4/dist` | 4 | 577.6 KiB | 106.4 KiB | 1 | 8.5 KiB |
| react-rsbuild-tailwindcss-v4 | weapp | `demo/web/react-rsbuild-tailwindcss-v4/dist-weapp` | 4 | 579.4 KiB | 106.5 KiB | 1 | 10.2 KiB |
| vue-rsbuild-tailwindcss-v4 | web | `demo/web/vue-rsbuild-tailwindcss-v4/dist` | 4 | 389.2 KiB | 91.7 KiB | 1 | 8.5 KiB |
| vue-rsbuild-tailwindcss-v4 | weapp | `demo/web/vue-rsbuild-tailwindcss-v4/dist-weapp` | 4 | 391.0 KiB | 91.7 KiB | 1 | 10.1 KiB |
| react-webpack-tailwindcss-v4 | web | `demo/web/react-webpack-tailwindcss-v4/dist` | 3 | 574.8 KiB | 105.2 KiB | 1 | 8.9 KiB |
| react-webpack-tailwindcss-v4 | weapp | `demo/web/react-webpack-tailwindcss-v4/dist-weapp` | 3 | 576.2 KiB | 105.2 KiB | 1 | 10.1 KiB |
| vue-webpack-tailwindcss-v4 | web | `demo/web/vue-webpack-tailwindcss-v4/dist` | 3 | 384.9 KiB | 90.0 KiB | 1 | 8.8 KiB |
| vue-webpack-tailwindcss-v4 | weapp | `demo/web/vue-webpack-tailwindcss-v4/dist-weapp` | 3 | 386.3 KiB | 90.0 KiB | 1 | 10.0 KiB |

## HMR

| Project | Status | devReadyMs | initialRenderMs | sourceWriteToDomUpdateMs | totalMs |
| --- | ---: | ---: | ---: | ---: | ---: |
| react-vite-tailwindcss-v4 | passed | 525 | 51 | 249 | 1585 |
| vue-vite-tailwindcss-v4 | passed | 516 | 51 | 214 | 1463 |
| react-rsbuild-tailwindcss-v4 | passed | 650 | 61 | 182 | 1586 |
| vue-rsbuild-tailwindcss-v4 | passed | 680 | 49 | 112 | 1537 |
| react-webpack-tailwindcss-v4 | passed | 1161 | 41 | 259 | 2162 |
| vue-webpack-tailwindcss-v4 | passed | 1205 | 55 | 227 | 2176 |

## Compare and screenshots

Compare report: `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/report.json`

| Project | web render | parity | weapp CSS | style diffs | class diffs | screenshots |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| react-vite-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-vite-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-vite-tailwindcss-v4-weapp.png` |
| vue-vite-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-vite-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-vite-tailwindcss-v4-weapp.png` |
| react-rsbuild-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-rsbuild-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-rsbuild-tailwindcss-v4-weapp.png` |
| vue-rsbuild-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-rsbuild-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-rsbuild-tailwindcss-v4-weapp.png` |
| react-webpack-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-webpack-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/react-webpack-tailwindcss-v4-weapp.png` |
| vue-webpack-tailwindcss-v4 | passed | passed | passed | 0 | 13 | `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-webpack-tailwindcss-v4-web.png`, `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/compare/vue-webpack-tailwindcss-v4-weapp.png` |

## Commands

- build-weapp-tailwindcss: `pnpm --filter weapp-tailwindcss build` in `.` -> passed, 2478ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/build-weapp-tailwindcss.log`
- react-vite-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:web` in `.` -> passed, 744ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-vite-tailwindcss-v4-build-web.log`
- react-vite-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:weapp` in `.` -> passed, 947ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-vite-tailwindcss-v4-build-weapp.log`
- vue-vite-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:web` in `.` -> passed, 743ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-vite-tailwindcss-v4-build-web.log`
- vue-vite-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:weapp` in `.` -> passed, 904ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-vite-tailwindcss-v4-build-weapp.log`
- react-rsbuild-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-react-rsbuild-tailwindcss-v4 build:web` in `.` -> passed, 709ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-rsbuild-tailwindcss-v4-build-web.log`
- react-rsbuild-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-react-rsbuild-tailwindcss-v4 build:weapp` in `.` -> passed, 966ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-rsbuild-tailwindcss-v4-build-weapp.log`
- vue-rsbuild-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-vue-rsbuild-tailwindcss-v4 build:web` in `.` -> passed, 743ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-rsbuild-tailwindcss-v4-build-web.log`
- vue-rsbuild-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-vue-rsbuild-tailwindcss-v4 build:weapp` in `.` -> passed, 972ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-rsbuild-tailwindcss-v4-build-weapp.log`
- react-webpack-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-react-webpack-tailwindcss-v4 build:web` in `.` -> passed, 1195ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-webpack-tailwindcss-v4-build-web.log`
- react-webpack-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-react-webpack-tailwindcss-v4 build:weapp` in `.` -> passed, 1327ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/react-webpack-tailwindcss-v4-build-weapp.log`
- vue-webpack-tailwindcss-v4-build-web: `pnpm --filter @weapp-tailwindcss-demo/web-vue-webpack-tailwindcss-v4 build:web` in `.` -> passed, 1203ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-webpack-tailwindcss-v4-build-web.log`
- vue-webpack-tailwindcss-v4-build-weapp: `pnpm --filter @weapp-tailwindcss-demo/web-vue-webpack-tailwindcss-v4 build:weapp` in `.` -> passed, 1358ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/vue-webpack-tailwindcss-v4-build-weapp.log`
- demo-web-compare: `pnpm demo:web:compare` in `.` -> passed, 25353ms, log `demo/web/report/web-full-report/2026-06-26T07-17-16-352Z/logs/demo-web-compare.log`

## Final git status

```text
## main...origin/main
 M demo/web/README.md
 M demo/web/react-rsbuild-tailwindcss-v4/src/main.tsx
 M demo/web/react-rsbuild-tailwindcss-v4/src/style.css
 M demo/web/react-vite-tailwindcss-v4/src/main.tsx
 M demo/web/react-webpack-tailwindcss-v4/src/main.tsx
 M demo/web/scripts/compare-dev-weapp.mjs
 M demo/web/shared/webpack-plugin-target.mjs
 M demo/web/style-output-report.md
 M demo/web/vue-rsbuild-tailwindcss-v4/src/App.vue
 M demo/web/vue-rsbuild-tailwindcss-v4/src/style.css
 M demo/web/vue-vite-tailwindcss-v4/src/App.vue
 M demo/web/vue-webpack-tailwindcss-v4/src/App.vue
 M e2e/web-css-preservation.test.ts
 M e2e/web-vite-demo-hmr-cases.ts
 M package.json
 M packages/weapp-tailwindcss/src/bundlers/vite/index.ts
 M packages/weapp-tailwindcss/test/bundlers/vite-plugin.bundle.unit.test.ts
 M submodules/tailwindcss-v4
?? demo/web/report/
?? packages/weapp-tailwindcss/src/bundlers/vite/serve-js-transform.ts
?? packages/weapp-tailwindcss/test/bundlers/vite-serve-js-transform.unit.test.ts
?? scripts/web-full-report.mjs
?? scripts/web-full-report/
?? submodules/tailwindcss-v3/
```

## Failures and notes

- No failing validation items were found.
- `report.json` contains raw command records, artifact sizes, compare details, and HMR timings.
