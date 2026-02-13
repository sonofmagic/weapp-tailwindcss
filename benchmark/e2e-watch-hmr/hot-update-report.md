# 热更新性能报告

- 更新时间：`2026-02-13`
- 单位：`ms`
- 基础数据源：`benchmark/e2e-watch-hmr/manual-demo.json`、`benchmark/e2e-watch-hmr/manual-apps.json`
- 重点 demo 追加来源：`watch-hmr-regression` 本轮重跑日志（新增 6 项重点观察）

## 各项目热更新时间

| 分组 | 项目                             | Template 热更新 | Script 热更新 | Style 热更新 | 项目热更新 (overall) | 状态                                    |
| ---- | -------------------------------- | --------------: | ------------: | -----------: | -------------------: | --------------------------------------- |
| apps | apps/taro-webpack-tailwindcss-v4 |            3167 |          2412 |         2413 |                 3167 | 基线数据                                |
| apps | apps/vite-native-ts              |             243 |           754 |          241 |                  243 | 基线数据                                |
| demo | demo/mpx-app                     |             482 |           487 |         1246 |                  482 | 基线数据                                |
| demo | demo/native-mina                 |             512 |           764 |          727 |                  512 | 基线数据                                |
| demo | demo/native-ts (weapp-vite)      |            3669 |          6967 |         1992 |                 3669 | 基线数据                                |
| demo | demo/rax-app                     |            1751 |          1954 |          972 |                 1751 | 基线数据                                |
| demo | demo/taro-app                    |            1213 |          1209 |         1720 |                 1213 | 基线数据                                |
| demo | demo/uni-app                     |            1280 |           487 |          490 |                 1280 | 基线数据                                |
| demo | demo/uni-app-vue3-vite           |            2702 |          1448 |          966 |                 2702 | 重点项目，已验证                        |
| demo | demo/uni-app-tailwindcss-v4      |             483 |          1739 |         1216 |                 1739 | 重点项目，已验证                        |
| demo | demo/taro-vite-tailwindcss-v4    |            1497 |          2274 |         2578 |                 2578 | 重点项目，已验证（style 回滚 fallback） |
| demo | demo/taro-app-vite               |             492 |           727 |          727 |                  727 | 重点项目，已验证（style 回滚 fallback） |
| demo | demo/taro-webpack-tailwindcss-v4 |             N/A |           N/A |          N/A |                  N/A | 重点项目，当前环境阻塞                  |
| demo | demo/taro-vue3-app               |             N/A |           N/A |          N/A |                  N/A | 重点项目，当前环境阻塞                  |

## 重点项目阻塞说明

| 项目                             | 阻塞原因                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| demo/taro-webpack-tailwindcss-v4 | watch 过程触发 Rust `tokio-runtime-worker` panic：`system-configuration` 动态存储返回 NULL，导致 `outputs were not updated after source change` |
| demo/taro-vue3-app               | 同上，watch 期间触发 Rust panic，导致输出未随源文件变更更新                                                                                     |

## 备注

- `overall` 使用 case 顶层 `hotUpdateEffectiveMs`；对于优选轮次，通常与 template/script/style 中的最大值相近。
- `style 回滚 fallback` 表示热更新生效可验证，但样式规则在该工具链下未自动从产物清除，回滚时延退化为输出更新时延指标（保留原有报告兼容行为）。
