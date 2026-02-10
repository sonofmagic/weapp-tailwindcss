# Vite Adapter Performance Summary

Generated at: 2026-02-10T05:57:12.864Z

| Metric      | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |
| ----------- | ------------------: | --------------------: | --------------------: | ---------------: | -----------------: | -----------------: | ----------: |
| startupMs   |             4305.00 |               4326.00 |                 64.20 |          4277.67 |            4153.00 |             187.01 |      -0.64% |
| hotUpdateMs |             4500.90 |               4467.04 |                255.84 |          4564.25 |            4474.74 |             243.54 |       1.39% |
| coldBuildMs |             4262.48 |               4162.39 |                152.71 |          4294.73 |            4320.12 |             109.48 |       0.75% |

## Notes

- `optimized` uses default runtime signature invalidation + dirty processing + JS precheck.
- `legacy` enables env toggles to emulate baseline behavior:
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`
