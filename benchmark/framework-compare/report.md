# 小程序框架性能对比（统一场景）

生成时间：2026-02-23T17:00:54.403Z

对比对象：`uni-app vue3`、`taro vue3`、`weapp-vite wevu`。

统一采集口径：

- 三组用例在采集前均会被临时替换为同一份标准 Vue SFC，采集结束后自动回滚。
- Build：执行项目 `build` 脚本，重复多轮取统计值。
- HMR：优先测量 watch 模式下源码改动到目标 `.wxml` 出现 marker 的耗时；watch 失败时自动回退到“源码改动 + 全量 build”补偿口径并标记模式。
- Runtime：统一执行 `ref.value` 大批量更新基准（批量长度与每轮操作次数一致），对比每轮内单次更新耗时。

## 总览

| 框架            | 项目                        | Build 中位数 (ms) | HMR 中位数 (ms) |       HMR 模式 | Runtime 单次 `ref.value` 中位数 (ms) | Runtime 单轮总耗时中位数 (ms) | Runtime 样本数 |
| --------------- | --------------------------- | ----------------: | --------------: | -------------: | -----------------------------------: | ----------------------------: | -------------: |
| uni-app vue3    | demo/uni-app-vue3-vite      |           3363.31 |         3158.29 | fallback-build |                               0.0010 |                          1.99 |              5 |
| taro vue3       | demo/taro-vue3-app          |         240027.78 |       240031.91 | fallback-build |                               0.0010 |                          1.91 |              5 |
| weapp-vite wevu | apps/vite-native-ts-skyline |           1177.35 |         1220.00 | fallback-build |                               0.0008 |                          1.36 |              5 |

### Build 排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1177.35 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 3363.31 ms
3. taro vue3 (demo/taro-vue3-app) - 240027.78 ms

### HMR 排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1220.00 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 3158.29 ms
3. taro vue3 (demo/taro-vue3-app) - 240031.91 ms

### Runtime `ref.value` 单次更新排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0008 ms
2. taro vue3 (demo/taro-vue3-app) - 0.0010 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0010 ms

### Runtime 单轮总耗时排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1.36 ms
2. taro vue3 (demo/taro-vue3-app) - 1.91 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 1.99 ms

## 异常记录

- uni-app vue3 (demo/uni-app-vue3-vite)
  - hmrWatch: attempt 1: [uni-app-vue3] hmr failed: [uni-app-vue3] hmr timeout marker=tw-framework-bench-32377202 | > @weapp-tailwindcss-demo/uni-app-vue3-vite@0.0.1 dev:mp-weixin <REPO_ROOT>/demo/uni-app-vue3-vite
- taro vue3 (demo/taro-vue3-app)
  - hmrWatch: attempt 1: [taro-vue3] hmr failed: [taro-vue3] dev warmup timeout | > @weapp-tailwindcss-demo/taro-vue3-app@1.0.0 dev:weapp <REPO_ROOT>/demo/taro-vue3-app
- weapp-vite wevu (apps/vite-native-ts-skyline)
  - hmrWatch: attempt 1: [weapp-vite-wevu] hmr failed: [weapp-vite-wevu] hmr timeout marker=tw-framework-bench-95960201 | > vite-native-ts-skyline@1.0.1 dev <REPO_ROOT>/apps/vite-native-ts-skyline

## 原始数据

- benchmark/framework-compare/data/framework-matrix-raw.json
