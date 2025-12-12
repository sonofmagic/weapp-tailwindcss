# Style Handler Benchmark

- Command: `pnpm test:bench packages/postcss/test/bench/style-handler.bench.ts`
- Runner: Vitest bench v4.0.15
- File: `packages/postcss/test/bench/style-handler.bench.ts`

| name                                       |       hz | min (ms) | max (ms) | mean (ms) | p75 (ms) | p99 (ms) | p995 (ms) | p999 (ms) | rme    | samples |
| ------------------------------------------ | -------: | -------: | -------: | --------: | -------: | -------: | --------: | --------: | ------ | ------: |
| tailwind v4 main chunk                     |   744.52 |   1.0479 |   4.1640 |    1.3431 |   1.4261 |   2.8384 |    3.9405 |    4.1640 | ±2.61% |     373 |
| tailwind v3 main chunk                     | 3,777.93 |   0.2124 |   2.2742 |    0.2647 |   0.2400 |   1.0225 |    1.1103 |    2.0057 | ±2.68% |   1,889 |
| rpx arbitrary value normalization (v2 jit) | 5,374.69 |   0.1693 |   0.5503 |    0.1861 |   0.1866 |   0.3876 |    0.4464 |    0.5277 | ±0.75% |   2,688 |

Summary:

- rpx arbitrary value normalization (v2 jit): 1.42x faster than tailwind v3 main chunk; 7.22x faster than tailwind v4 main chunk.
