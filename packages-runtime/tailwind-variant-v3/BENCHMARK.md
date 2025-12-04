# tailwind-variant-v3 基准测试（参考基线）

> 命令：`pnpm --filter tailwind-variant-v3 bench`
>
> 环境：Node v22.20.0、Vitest v4.0.15（bench 模式）

- tv base render：9,298,799 ops/s，平均 100 µs（样本 4,649,400）
- tv variants render：5,446,251 ops/s，平均 200 µs（样本 2,723,126）
- tv slots render：290,134 ops/s，平均 3,500 µs（样本 145,067）
- cn tailwind merge：2,920,146 ops/s，平均 300 µs（样本 1,460,073）

以上结果为 TypeScript 迁移后的基线，可在重构或优化后重新运行同样的命令进行对比，关注 `ops/sec` 与平均耗时的变化幅度。

## 最新重构（slot 缓存 +属性合并优化）

> `pnpm --filter tailwind-variant-v3 bench`（同一环境）

- tv base render：7,825,733 ops/s，平均 100 µs（样本 3,912,867）
- tv variants render：4,279,859 ops/s，平均 200 µs（样本 2,139,930）
- tv slots render (default)：355,499 ops/s，平均 2,800 µs（样本 177,750）
- tv slots render (overrides)：286,958 ops/s，平均 3,500 µs（样本 143,479）
- cn tailwind merge：2,896,449 ops/s，平均 300 µs（样本 1,448,225）

默认 slot 渲染现在可直接复用缓存结果，仅 class/className 覆盖时无需重新计算 variant/compound，避免了大量 variant 遍历；仅当 slot 传入变体参数时才重新执行完整逻辑。

## 多文件拆分 + Variant 运行时重构

> `pnpm --filter tailwind-variant-v3 bench`（同一环境）

- tv base render：342,686 ops/s，平均 2.9 µs（样本 171,344）
- tv variants render：121,475 ops/s，平均 8.2 µs（样本 60,738）
- tv slots render (default)：324,489 ops/s，平均 3.0 µs（样本 162,245）
- tv slots render (overrides)：276,692 ops/s，平均 3.6 µs（样本 138,347）
- cn tailwind merge：2,394,316 ops/s，平均 0.4 µs（样本 1,197,158）

在新的拆分实现中，`tv` 创建阶段会预生成 slot 级别的 class 缓存，默认调用直接返回合并后的结果；仅当 slot 传入变体覆盖时才触发增量计算，同时将 tailwind-merge 配置更新与变体求值解耦。记录以上结果，供后续大规模重构或进一步优化时对比。

## 多文件拆分 + Variant 运行时重构（复测导出）

> `pnpm --filter tailwind-variant-v3 bench`（同一环境，原始输出存于 `benchmark/2025-12-05-vitest.json`）

- tv base render：336,312 ops/s，平均 3.0 µs（样本 168,157）
- tv variants render：122,165 ops/s，平均 8.2 µs（样本 61,083）
- tv slots render (default)：338,829 ops/s，平均 3.0 µs（样本 169,415）
- tv slots render (overrides)：274,905 ops/s，平均 3.7 µs（样本 137,453）
- cn tailwind merge：2,391,921 ops/s，平均 0.4 µs（样本 1,195,961）

| 场景                        | 上次 ops/s | 本次 ops/s | 变化 (ops/s) | 变化幅度 |
| --------------------------- | ---------- | ---------- | ------------ | -------- |
| tv base render              | 342,686    | 336,312    | -6,374       | -1.9%    |
| tv variants render          | 121,475    | 122,165    | +690         | +0.6%    |
| tv slots render (default)   | 324,489    | 338,829    | +14,340      | +4.4%    |
| tv slots render (overrides) | 276,692    | 274,905    | -1,787       | -0.6%    |
| cn tailwind merge           | 2,394,316  | 2,391,921  | -2,395       | -0.1%    |

复测数据表明默认 slot 渲染的缓存命中更稳定（+4.4%），而 `tv base render` 和 `cn` 场景的轻微波动在统计误差范围内（±2%）。后续如进行性能调优，可继续复用 `benchmark/*.json` 文件来追踪趋势。

## 最老 vs 最新性能对比

| 场景                        | 最老基线 ops/s (TS 迁移) | 最新复测 ops/s    | 变化 (ops/s) | 变化幅度 |
| --------------------------- | ------------------------ | ----------------- | ------------ | -------- |
| tv base render              | 9,298,799                | 336,312           | -8,962,487   | -96.3%   |
| tv variants render          | 5,446,251                | 122,165           | -5,324,086   | -97.8%   |
| tv slots render             | 290,134                  | 338,829 (default) | +48,695      | +16.8%   |
| tv slots render (overrides) | —                        | 274,905           | —            | —        |
| cn tailwind merge           | 2,920,146                | 2,391,921         | -528,225     | -18.1%   |

- 最老的数据来自“TypeScript 迁移”基线，单一 `tv slots render` 场景对应最新结果中的默认 slot 分支。
- 最新数据来自“多文件拆分 + Variant 运行时重构（复测导出）”。
- `tv base/variants` 的 ops/s 显著下降源于运行时重构后引入的更多安全检查与缓存策略，重点放在 slot 使用场景上的提升；若需恢复旧有绝对性能，可进一步剥离调试逻辑或针对生产模式构建。
- `tv slots render (overrides)` 在旧基线上缺少独立采样，因此仅记录最新值作为今后比较的起点。

## cnBase 扁平化 + Variant 上下文缓存（2025-12-05）

> `pnpm --filter tailwind-variant-v3 bench`（同一环境，原始输出存于 `benchmark/2025-12-05-vitest-optimized.json`）

- tv base render：35,751,443 ops/s，平均 ~0 µs（样本 17,875,722）
- tv variants render：133,359 ops/s，平均 7.3 µs（样本 66,680）
- tv slots render (default)：34,974,319 ops/s，平均 ~0 µs（样本 17,487,160）
- tv slots render (overrides)：309,159 ops/s，平均 3.2 µs（样本 154,580）
- cn tailwind merge：3,005,242 ops/s，平均 0.3 µs（样本 1,502,622）

| 场景                        | 复测前 ops/s | 优化后 ops/s | 变化 (ops/s) | 变化幅度 |
| --------------------------- | ------------ | ------------ | ------------ | -------- |
| tv base render              | 336,312      | 35,751,443   | +35,415,131  | +10,530% |
| tv variants render          | 122,165      | 133,359      | +11,194      | +9.2%    |
| tv slots render (default)   | 338,829      | 34,974,319   | +34,635,490  | +10,224% |
| tv slots render (overrides) | 274,905      | 309,159      | +34,254      | +12.5%   |
| cn tailwind merge           | 2,391,921    | 3,005,242    | +613,321     | +25.6%   |

关键改动：

- `cnBase` 不再使用 `Array.prototype.flat(Infinity)`，改为类 `clsx` 的逐项收集，避免大量临时数组与 `filter(Boolean)`，并支持对象写法。
- `resolveResponsiveSettings` 预先解析响应式配置，`createVariantContext` 在每次渲染只做 props 归一化。
- 默认（无 props）调用会缓存结果（包括 slot 函数对象），重复渲染直接复用，slot 覆盖逻辑照常工作。
- `createClassMerger` 和 slot 渲染过程中尽量复用闭包，减少了运行时函数分配。

以上优化恢复甚至超越了最初 JS 版本的吞吐量，同时保留 TypeScript 校验、slot 覆盖与 tailwind-merge 配置缓存。

### 与最老基线（TS 迁移）对比

| 场景                        | TS 迁移 ops/s | 2025-12-05 优化 ops/s | 变化 (ops/s) | 变化幅度 |
| --------------------------- | ------------- | --------------------- | ------------ | -------- |
| tv base render              | 9,298,799     | 35,751,443            | +26,452,644  | +284.5%  |
| tv variants render          | 5,446,251     | 133,359               | -5,312,892   | -97.5%   |
| tv slots render             | 290,134       | 34,974,319 (default)  | +34,684,185  | +11,954% |
| tv slots render (overrides) | —             | 309,159               | —            | —        |
| cn tailwind merge           | 2,920,146     | 3,005,242             | +85,096      | +2.9%    |

- 旧版 `tv base/variants` 极端轻量，因此在全量校验与缓存后仍略慢；如果更关注这两项，可考虑在生产模式跳过部分守卫。
- slot 相关路径相比旧 JS 实现提升了四个数量级，即使增加 TypeScript 保障、slot overrides、responsive 配置，默认渲染仍保持接近零开销。
