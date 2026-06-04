# 当前版本 vs 发布版本 Benchmark 详细报告

## 运行信息

- GitHub Actions run: `25743489892`
- Workflow: `Benchmark`
- Job: `Current vs published weapp-tailwindcss`
- Branch: `next`
- Commit: `7cf16888ade8a0f8c6768056b4e058abbeb71af5`
- 生成时间: `2026-05-12T15:24:04.715Z`
- 运行结果: 通过，失败项 `0`

## 对比口径

- 当前版本: `current:5.0.0-next.7`
- 发布基线: `published:weapp-tailwindcss@next`
- Build 采样次数: `3`
- HMR 采样次数: `5`
- 超时时间: `180000ms`
- 轮询间隔: `120ms`
- 统计口径: 使用稳态中位数；多次采样时会跳过首轮冷启动数据。

## 总览

| 指标 | 平均变化 |
| --- | ---: |
| Build 稳态中位数 | -0.80% |
| HMR 稳态中位数 | +0.40% |

Build 平均略快于发布基线，HMR 平均略慢于发布基线。两者都处于小幅波动范围内，本次 CI 没有失败项目。

## 项目明细

| 项目 | Baseline Build(ms) | Current Build(ms) | Build 变化 | Baseline HMR(ms) | Current HMR(ms) | HMR 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `demo-uni-app-vue3-vite` | 388.75 | 391.60 | +0.73% | 3138.34 | 3135.36 | -0.09% |
| `demo-uni-app-tailwindcss-v4` | 488.60 | 491.76 | +0.65% | 965.22 | 965.00 | -0.02% |
| `apps-vite-native-ts` | 4057.77 | 4001.87 | -1.38% | 604.36 | 604.12 | -0.04% |
| `apps-vite-native` | 5760.66 | 5582.20 | -3.10% | 1506.91 | 1518.58 | +0.77% |
| `apps-vite-native-skyline` | 3006.95 | 2939.85 | -2.23% | 362.06 | 362.91 | +0.24% |
| `apps-vite-native-ts-skyline` | 4825.33 | 4734.58 | -1.88% | 1146.40 | 1148.12 | +0.15% |
| `demo-native-ts` | 17070.25 | 17198.21 | +0.75% | 17587.19 | 18002.09 | +2.36% |
| `apps-weapp-wechat-zhihu` | 1968.80 | 1969.57 | +0.04% | 121.44 | 121.28 | -0.13% |

## 结论

- 本次新增的 `demo-uni-app-tailwindcss-v4` published baseline 依赖补全后，完整矩阵不再出现 `@weapp-core/escape` 解析失败。
- `demo-native-ts` 的 HMR 慢约 `+2.36%`，是本次 HMR 变化最大的项目；但绝对值仍在同一量级，且没有触发失败。
- `apps-vite-native` 和 Skyline 相关项目 build 明显快于发布基线，是本次 build 平均值变好的主要来源。
- 当前 CI 已将该 benchmark 作为独立 workflow 固定运行，并上传 `summary.json`、`matrix-raw.json`、`report.md`、`versions.json` artifact。
