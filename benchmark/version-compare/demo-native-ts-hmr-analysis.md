# demo-native-ts 稳态 HMR 拉高分析（4.9.8 vs 4.10.2）

## 背景

在扩展矩阵中，`demo-native-ts` 的稳态 HMR 出现明显回归：

- `4.9.8`：`243.81ms`
- `4.10.2`：`364.34ms`
- 变化：`+49.43%`

原始矩阵见：`benchmark/version-compare/report.md`。

## 排查方法

为了区分“真实变慢”和“采样粒度放大”，做了三组定向复测（仅 `demo-native-ts`）：

1. 高精度采样：`poll-interval=20ms`，`hmr-runs=12`
2. 粗粒度采样：`poll-interval=120ms`，`hmr-runs=12`
3. 高精度 + 去除额外扫描路径：
   - 临时移除 `demo/native-ts/tailwind.config.js` 中 `tailwindcss-core-plugins-extractor` 的 `content` 扫描行后复测

相关数据文件：

- `benchmark/version-compare/data/matrix-debug-demo-native-ts-hires.json`
- `benchmark/version-compare/data/matrix-debug-demo-native-ts-coarse12.json`
- `benchmark/version-compare/data/matrix-debug-demo-native-ts-hires-no-extractor.json`

## 结果

| 场景                    | 4.9.8 稳态 HMR 中位数 | 4.10.2 稳态 HMR 中位数 |    变化 |
| ----------------------- | --------------------: | ---------------------: | ------: |
| 高精度（20ms）          |              232.97ms |               296.71ms | +27.36% |
| 粗粒度（120ms）         |              243.22ms |               365.14ms | +50.13% |
| 高精度 + 去额外扫描路径 |               65.13ms |                64.32ms |  -1.24% |

附加观察：

- 在 `20ms` 采样下，仍存在稳定回归（约 `+64ms`），说明不只是采样误差。
- 在 `120ms` 采样下，回归会被放大，和主矩阵 `+49.43%` 接近。
- 去掉额外扫描路径后，两版本都显著变快，且 `4.10.2` 不再慢于 `4.9.8`。

## 归因结论

`demo-native-ts` 回归主要是配置层面触发的高成本扫描，在 `4.10.x` 的增量链路上更容易放大，而非业务模板或 HMR 功能异常。

关键证据：

- `demo/native-ts/tailwind.config.js:11` 额外扫描 `../../packages/tailwindcss-core-plugins-extractor/src/**/*.ts`
- `benchmark/version-compare/scripts/run-matrix.mjs:164` 默认轮询间隔为 `120ms`，会放大接近阈值的差异
- `packages/weapp-tailwindcss/src/bundlers/vite/generate-bundle.ts:329` 附近新增增量脏检查与哈希流程，HMR 每轮固定成本更可见
- `packages/weapp-tailwindcss/src/bundlers/vite/index.ts:104` 附近 runtime 刷新判定与缓存策略更严格

## 建议

1. 对 `demo/native-ts`，避免在常规 HMR 场景扫描跨包 `extractor` 源码路径。
2. benchmark 默认使用 `--poll-interval 20` 或 `30`，减少“档位化”误差。
3. 保留现有矩阵作为“真实用户默认体验”基线，同时增加一份“高精度采样”对照报告。

## 复现实验命令

```bash
# 高精度
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 1 --hmr-runs 12 --poll-interval 20 --timeout 180000 --only demo-native-ts --out benchmark/version-compare/data/matrix-debug-demo-native-ts-hires.json

# 粗粒度
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 1 --hmr-runs 12 --poll-interval 120 --timeout 180000 --only demo-native-ts --out benchmark/version-compare/data/matrix-debug-demo-native-ts-coarse12.json
```
