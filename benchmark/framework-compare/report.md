# 小程序框架性能对比（统一场景）

生成时间：2026-02-23T18:35:34.337Z

对比对象：`uni-app vue3`、`taro vue3`、`weapp-vite wevu`。

统一采集口径：

- 三组用例在采集前均会被临时替换为同一份标准 Vue SFC，采集结束后自动回滚。
- Build：执行项目 `build` 脚本，重复多轮取统计值。
- HMR：优先测量 watch 模式下源码改动到目标产物文件（`wxml/js`）出现 marker 的耗时；watch 失败时自动回退到“源码改动 + 全量 build”补偿口径并标记模式。
- Runtime：统一执行 `ref.value` 大批量更新基准，按数量级分层统计单次更新耗时。
- Runtime 数量级：10, 100, 1000, 10000, 1000000

## 总览

| 框架            | 项目                                                 | Build 中位数 (ms) | HMR 中位数 (ms) |       HMR 模式 | Runtime 单次 ref.value 中位数 @1000000 (ms) | Runtime 单轮总耗时中位数 @1000000 (ms) | Runtime 样本数 |
| --------------- | ---------------------------------------------------- | ----------------: | --------------: | -------------: | ------------------------------------------: | -------------------------------------: | -------------: |
| uni-app vue3    | benchmark/framework-compare/projects/uni-app-vue3    |           1871.01 |         1850.61 | fallback-build |                                      0.0403 |                                  96.68 |              3 |
| taro vue3       | benchmark/framework-compare/projects/taro-vue3       |           2585.01 |         2712.73 | fallback-build |                                      0.0385 |                                 102.99 |              3 |
| weapp-vite wevu | benchmark/framework-compare/projects/weapp-vite-wevu |            961.55 |          922.91 | fallback-build |                                      0.0290 |                                 105.50 |              3 |

## Runtime 多数量级

| 框架            | 项目                                                 |    @10 |   @100 |  @1000 | @10000 | @1000000 |
| --------------- | ---------------------------------------------------- | -----: | -----: | -----: | -----: | -------: |
| uni-app vue3    | benchmark/framework-compare/projects/uni-app-vue3    | 0.0009 | 0.0008 | 0.0009 | 0.0014 |   0.0403 |
| taro vue3       | benchmark/framework-compare/projects/taro-vue3       | 0.0009 | 0.0009 | 0.0010 | 0.0014 |   0.0385 |
| weapp-vite wevu | benchmark/framework-compare/projects/weapp-vite-wevu | 0.0005 | 0.0005 | 0.0006 | 0.0012 |   0.0290 |

### Runtime 每轮操作次数

|    规模 | 每轮操作次数 |
| ------: | -----------: |
|      10 |          160 |
|     100 |          160 |
|    1000 |          160 |
|   10000 |          160 |
| 1000000 |            5 |

### Build 排名（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 961.55 ms
2. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 1871.01 ms
3. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 2585.01 ms

### HMR 排名（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 922.91 ms
2. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 1850.61 ms
3. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 2712.73 ms

### Runtime ref.value 单次更新排名 @10（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 0.0005 ms
2. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 0.0009 ms
3. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 0.0009 ms

### Runtime ref.value 单次更新排名 @100（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 0.0005 ms
2. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 0.0008 ms
3. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 0.0009 ms

### Runtime ref.value 单次更新排名 @1000（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 0.0006 ms
2. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 0.0009 ms
3. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 0.0010 ms

### Runtime ref.value 单次更新排名 @10000（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 0.0012 ms
2. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 0.0014 ms
3. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 0.0014 ms

### Runtime ref.value 单次更新排名 @1000000（中位数，越小越好）

1. weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu) - 0.0290 ms
2. taro vue3 (benchmark/framework-compare/projects/taro-vue3) - 0.0385 ms
3. uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3) - 0.0403 ms

## 异常记录

- uni-app vue3 (benchmark/framework-compare/projects/uni-app-vue3)
  - hmrWatch: attempt 1: [uni-app-vue3] hmr failed: [uni-app-vue3] hmr timeout marker=tw-framework-bench-32505801 | > benchmark-framework-compare-uni-app-vue3@0.0.0 dev:mp-weixin <REPO_ROOT>/benchmark/framework-compare/projects/uni-app-vue3
- taro vue3 (benchmark/framework-compare/projects/taro-vue3)
  - hmrWatch: attempt 1: [taro-vue3] hmr failed: [taro-vue3] hmr timeout marker=tw-framework-bench-46755002 | Watchpack Error (watcher): Error: EMFILE: too many open files, watch
- weapp-vite wevu (benchmark/framework-compare/projects/weapp-vite-wevu)
  - hmrWatch: attempt 1: [weapp-vite-wevu] hmr failed: [weapp-vite-wevu] hmr timeout marker=tw-framework-bench-60722201 | > benchmark-framework-compare-weapp-vite-wevu@0.0.0 dev <REPO_ROOT>/benchmark/framework-compare/projects/weapp-vite-wevu

## 原始数据

- benchmark/framework-compare/data/framework-matrix-raw.json
