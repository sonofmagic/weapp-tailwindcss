# 小程序框架性能对比（统一场景）

生成时间：2026-02-23T17:21:33.675Z

对比对象：`uni-app vue3`、`taro vue3`、`weapp-vite wevu`。

统一采集口径：

- 三组用例在采集前均会被临时替换为同一份标准 Vue SFC，采集结束后自动回滚。
- Build：执行项目 `build` 脚本，重复多轮取统计值。
- HMR：优先测量 watch 模式下源码改动到目标 `.wxml` 出现 marker 的耗时；watch 失败时自动回退到“源码改动 + 全量 build”补偿口径并标记模式。
- Runtime：统一执行 `ref.value` 大批量更新基准，按数量级分层统计单次更新耗时。
- Runtime 数量级：10, 100, 1000, 10000, 1000000

## 总览

| 框架            | 项目                        | Build 中位数 (ms) | HMR 中位数 (ms) |       HMR 模式 | Runtime 单次 ref.value 中位数 @1000000 (ms) | Runtime 单轮总耗时中位数 @1000000 (ms) | Runtime 样本数 |
| --------------- | --------------------------- | ----------------: | --------------: | -------------: | ------------------------------------------: | -------------------------------------: | -------------: |
| uni-app vue3    | demo/uni-app-vue3-vite      |           3266.79 |         2536.51 |          watch |                                      0.0417 |                                 103.16 |              3 |
| taro vue3       | demo/taro-vue3-app          |         240031.08 |       240023.53 | fallback-build |                                      0.0345 |                                  97.15 |              3 |
| weapp-vite wevu | apps/vite-native-ts-skyline |           1437.67 |         1308.94 | fallback-build |                                      0.0251 |                                  98.06 |              3 |

## Runtime 多数量级

| 框架            | 项目                        |    @10 |   @100 |  @1000 | @10000 | @1000000 |
| --------------- | --------------------------- | -----: | -----: | -----: | -----: | -------: |
| uni-app vue3    | demo/uni-app-vue3-vite      | 0.0009 | 0.0009 | 0.0010 | 0.0013 |   0.0417 |
| taro vue3       | demo/taro-vue3-app          | 0.0009 | 0.0008 | 0.0010 | 0.0013 |   0.0345 |
| weapp-vite wevu | apps/vite-native-ts-skyline | 0.0006 | 0.0006 | 0.0006 | 0.0011 |   0.0251 |

### Runtime 每轮操作次数

|    规模 | 每轮操作次数 |
| ------: | -----------: |
|      10 |          160 |
|     100 |          160 |
|    1000 |          160 |
|   10000 |          160 |
| 1000000 |            5 |

### Build 排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1437.67 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 3266.79 ms
3. taro vue3 (demo/taro-vue3-app) - 240031.08 ms

### HMR 排名（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 1308.94 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 2536.51 ms
3. taro vue3 (demo/taro-vue3-app) - 240023.53 ms

### Runtime ref.value 单次更新排名 @10（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0006 ms
2. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0009 ms
3. taro vue3 (demo/taro-vue3-app) - 0.0009 ms

### Runtime ref.value 单次更新排名 @100（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0006 ms
2. taro vue3 (demo/taro-vue3-app) - 0.0008 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0009 ms

### Runtime ref.value 单次更新排名 @1000（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0006 ms
2. taro vue3 (demo/taro-vue3-app) - 0.0010 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0010 ms

### Runtime ref.value 单次更新排名 @10000（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0011 ms
2. taro vue3 (demo/taro-vue3-app) - 0.0013 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0013 ms

### Runtime ref.value 单次更新排名 @1000000（中位数，越小越好）

1. weapp-vite wevu (apps/vite-native-ts-skyline) - 0.0251 ms
2. taro vue3 (demo/taro-vue3-app) - 0.0345 ms
3. uni-app vue3 (demo/uni-app-vue3-vite) - 0.0417 ms

## 异常记录

- taro vue3 (demo/taro-vue3-app)
  - hmrWatch: attempt 1: [taro-vue3] hmr failed: [taro-vue3] dev warmup timeout | > @weapp-tailwindcss-demo/taro-vue3-app@1.0.0 dev:weapp <REPO_ROOT>/demo/taro-vue3-app
- weapp-vite wevu (apps/vite-native-ts-skyline)
  - hmrWatch: attempt 1: [weapp-vite-wevu] hmr failed: [weapp-vite-wevu] hmr timeout marker=tw-framework-bench-20129401 | > vite-native-ts-skyline@1.0.1 dev <REPO_ROOT>/apps/vite-native-ts-skyline

## 原始数据

- benchmark/framework-compare/data/framework-matrix-raw.json
