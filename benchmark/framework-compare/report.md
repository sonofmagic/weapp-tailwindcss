# 小程序框架性能对比（统一场景）

生成时间：2026-02-23T15:29:14.461Z

对比对象：`uni-app vue3`、`taro vue3`、`weapp-vite wevu`。

统一采集口径：

- 三组用例在采集前均会被临时替换为同一份标准 Vue SFC，采集结束后自动回滚。
- Build：执行项目 `build` 脚本，重复多轮取统计值。
- HMR：在三组 `.vue` 页面中注入同一批 class 语料，测量源码改动到目标 `.wxml` 出现 marker 的耗时。
- Runtime：基于 `miniprogram-automator` 采集冷启动、首屏可读、`setData` 往返。

## 总览

| 框架            | 项目                        | Build 中位数 (ms) | HMR 中位数 (ms) | Runtime 冷启动中位数 (ms) | Runtime 首屏中位数 (ms) | Runtime setData 中位数 (ms) | Runtime 样本数 |
| --------------- | --------------------------- | ----------------: | --------------: | ------------------------: | ----------------------: | --------------------------: | -------------: |
| uni-app vue3    | demo/uni-app-vue3-vite      |           3334.80 |             N/A |                       N/A |                     N/A |                         N/A |              0 |
| taro vue3       | demo/taro-vue3-app          |          60032.14 |             N/A |                       N/A |                     N/A |                         N/A |              0 |
| weapp-vite wevu | apps/vite-native-ts-skyline |           1172.31 |             N/A |                       N/A |                     N/A |                         N/A |              0 |

### Build 排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1172.31 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 3334.80 ms
3. taro vue3 (demo/taro-vue3-app) - 60032.14 ms

### HMR 排名（中位数，越小越好）

- 当前无有效样本。

### Runtime 冷启动排名（中位数，越小越好）

- 当前无有效样本。

### Runtime 首屏排名（中位数，越小越好）

- 当前无有效样本。

### Runtime setData 排名（中位数，越小越好）

- 当前无有效样本。

## 异常记录

- uni-app vue3 (demo/uni-app-vue3-vite)
  - hmr: [uni-app-vue3] hmr failed: [uni-app-vue3] hmr timeout marker=tw-framework-bench-19002902 | > @weapp-tailwindcss-demo/uni-app-vue3-vite@0.0.1 dev:mp-weixin <REPO_ROOT>/demo/uni-app-vue3-vite
  - runtime: listen EPERM: operation not permitted 0.0.0.0
- taro vue3 (demo/taro-vue3-app)
  - hmr: [taro-vue3] hmr failed: [taro-vue3] dev warmup timeout | > @weapp-tailwindcss-demo/taro-vue3-app@1.0.0 dev:weapp <REPO_ROOT>/demo/taro-vue3-app
  - runtime: listen EPERM: operation not permitted 0.0.0.0
- weapp-vite wevu (apps/vite-native-ts-skyline)
  - hmr: [weapp-vite-wevu] hmr failed: [weapp-vite-wevu] hmr timeout marker=tw-framework-bench-49441101 | > vite-native-ts-skyline@1.0.1 dev <REPO_ROOT>/apps/vite-native-ts-skyline
  - runtime: listen EPERM: operation not permitted 0.0.0.0

## 原始数据

- benchmark/framework-compare/data/framework-matrix-raw.json
