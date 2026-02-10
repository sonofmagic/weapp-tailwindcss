# Vite Adapter Performance Summary

Generated at: 2026-02-10T06:00:03.046Z

| Metric      | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |
| ----------- | ------------------: | --------------------: | --------------------: | ---------------: | -----------------: | -----------------: | ----------: |
| startupMs   |             4904.33 |               4971.00 |                299.31 |          4897.67 |            4901.00 |             202.50 |      -0.14% |
| hotUpdateMs |             4863.63 |               4834.45 |                 73.58 |          4908.68 |            4997.37 |             146.36 |       0.92% |
| coldBuildMs |             4724.41 |               4607.56 |                185.60 |          4602.81 |            4600.46 |              19.26 |      -2.64% |

## Notes

- `optimized` uses default runtime signature invalidation + dirty processing + JS precheck.
- `legacy` enables env toggles to emulate baseline behavior:
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`
