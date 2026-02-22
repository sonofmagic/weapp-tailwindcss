# weapp-tailwindcss 4.9.8 vs 4.10.2 性能对比

生成时间：2026-02-22T16:40:30.319Z

## 核心结论

- 多项目稳态 Build（中位数）在 4.10.2 相比 4.9.8 平均 -1.89%。
- 多项目稳态 HMR（中位数）在 4.10.2 相比 4.9.8 平均 +4.81%。
- 多项目首轮 Build 在 4.10.2 相比 4.9.8 平均 -2.00%，首轮 HMR 平均 -2.98%。
- 单项目深度样本（demo/uni-app-vue3-vite, 5 build / 8 hmr）中，稳态 Build 变化 +0.34%，稳态 HMR 变化 -19.52%。

## 单项目深度对比（demo/uni-app-vue3-vite）

样本参数：build 5 次，hmr 8 次。

| 指标                  |   4.9.8 |  4.10.2 |    变化 |
| --------------------- | ------: | ------: | ------: |
| 首轮 Build (ms)       | 3332.02 | 5687.64 | +70.70% |
| Build 稳态中位数 (ms) | 3091.63 | 3102.21 |  +0.34% |
| 首轮 HMR (ms)         | 2298.97 | 1454.86 | -36.72% |
| HMR 稳态中位数 (ms)   |  602.39 |  484.79 | -19.52% |

## 多项目矩阵（稳态中位数）

| 项目                        | Build 4.9.8 | Build 4.10.2 | Build 变化 | HMR 4.9.8 | HMR 4.10.2 | HMR 变化 |
| --------------------------- | ----------: | -----------: | ---------: | --------: | ---------: | -------: |
| demo-uni-app-vue3-vite      |     3086.07 |      3137.51 |     +1.67% |    669.78 |     606.44 |   -9.46% |
| demo-uni-app-tailwindcss-v4 |     3196.99 |      3113.23 |     -2.62% |    364.61 |     363.70 |   -0.25% |
| apps-vite-native-ts         |     1138.15 |      1044.47 |     -8.23% |    123.32 |     122.54 |   -0.63% |
| apps-vite-native            |     1916.75 |      1720.27 |    -10.25% |    485.11 |     486.14 |   +0.21% |
| apps-vite-native-skyline    |      954.67 |       855.26 |    -10.41% |    122.51 |     121.99 |   -0.42% |
| apps-vite-native-ts-skyline |     1157.50 |      1253.07 |     +8.26% |    122.64 |     122.19 |   -0.37% |
| demo-native-ts              |     2719.53 |      2980.09 |     +9.58% |    243.81 |     364.34 |  +49.43% |
| apps-weapp-wechat-zhihu     |      662.14 |       641.66 |     -3.09% |    122.36 |     122.34 |   -0.02% |

## 多项目矩阵（首轮）

| 项目                        | 首轮 Build 4.9.8 | 首轮 Build 4.10.2 | Build 变化 | 首轮 HMR 4.9.8 | 首轮 HMR 4.10.2 | HMR 变化 |
| --------------------------- | ---------------: | ----------------: | ---------: | -------------: | --------------: | -------: |
| demo-uni-app-vue3-vite      |          3319.61 |           3402.04 |     +2.48% |        2180.79 |         2301.24 |   +5.52% |
| demo-uni-app-tailwindcss-v4 |          3412.73 |           3218.77 |     -5.68% |        1815.48 |         1695.20 |   -6.63% |
| apps-vite-native-ts         |          1361.59 |           1181.89 |    -13.20% |        1209.71 |         1090.06 |   -9.89% |
| apps-vite-native            |          1973.41 |           1786.46 |     -9.47% |        1933.42 |         1814.14 |   -6.17% |
| apps-vite-native-skyline    |           936.91 |            864.73 |     -7.70% |         968.80 |          846.55 |  -12.62% |
| apps-vite-native-ts-skyline |          1165.96 |           1306.49 |    +12.05% |        1210.99 |         1333.88 |  +10.15% |
| demo-native-ts              |          2798.88 |           3028.25 |     +8.20% |        2783.66 |         2663.81 |   -4.31% |
| apps-weapp-wechat-zhihu     |           671.36 |            653.59 |     -2.65% |         725.69 |          726.42 |   +0.10% |

## 异常与处理

- 本轮首轮矩阵无失败项，无需补跑。

## 数据与脚本

- 矩阵原始数据：`benchmark/version-compare/data/matrix-raw.json`
- 矩阵补跑数据：`benchmark/version-compare/data/matrix-raw-rerun.json`
- 矩阵最终数据：`benchmark/version-compare/data/matrix-final.json`
- 单项目原始数据：`benchmark/version-compare/data/single-raw-4.9.8.json`、`benchmark/version-compare/data/single-raw-4.10.2.json`
- 汇总 JSON：`benchmark/version-compare/data/summary.json`
- 跑矩阵脚本：`benchmark/version-compare/scripts/run-matrix.mjs`
- 生成报告脚本：`benchmark/version-compare/scripts/generate-report.mjs`

## 复现实验命令

```bash
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 3 --hmr-runs 5 --timeout 180000 --out benchmark/version-compare/data/matrix-raw.json
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 3 --hmr-runs 5 --timeout 180000 --only <失败项目key逗号列表> --out benchmark/version-compare/data/matrix-raw-rerun.json
node benchmark/version-compare/scripts/generate-report.mjs
```
