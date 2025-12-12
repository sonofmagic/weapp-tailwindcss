# Style Handler Benchmark

- Command: `pnpm test:bench packages/postcss/test/bench/style-handler.bench.ts`
- Runner: Vitest bench v4.0.15
- File: `packages/postcss/test/bench/style-handler.bench.ts`

| name                                       |     hz | min (ms) | max (ms) | mean (ms) | p75 (ms) | p99 (ms) | p995 (ms) | p999 (ms) | rme    | samples |
| ------------------------------------------ | -----: | -------: | -------: | --------: | -------: | -------: | --------: | --------: | ------ | ------: |
| tailwind v4 main chunk                     | 441.77 |   1.8632 |   3.3745 |    2.2636 |   2.4403 |   3.1385 |    3.2250 |    3.3745 | ±1.89% |     221 |
| tailwind v3 main chunk                     | 872.95 |   0.9596 |   2.1530 |    1.1455 |   1.1780 |   2.0748 |    2.1302 |    2.1530 | ±1.94% |     437 |
| rpx arbitrary value normalization (v2 jit) | 975.46 |   0.9116 |   1.9130 |    1.0252 |   1.0305 |   1.7312 |    1.8215 |    1.9130 | ±1.36% |     488 |

Summary:

- rpx arbitrary value normalization (v2 jit): 1.12x faster than tailwind v3 main chunk; 2.21x faster than tailwind v4 main chunk.
