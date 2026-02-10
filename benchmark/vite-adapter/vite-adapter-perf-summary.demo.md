# Vite Adapter Performance Summary

Generated at: 2026-02-10T05:12:55.893Z

| Metric      | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |
| ----------- | ------------------: | --------------------: | --------------------: | ---------------: | -----------------: | -----------------: | ----------: |
| startupMs   |            11683.33 |               9428.00 |               4805.52 |          7595.67 |            6571.00 |            2200.68 |     -53.82% |
| hotUpdateMs |            17458.53 |              13395.49 |              10001.61 |          5877.67 |            6138.28 |             463.15 |    -197.03% |
| coldBuildMs |            13993.93 |              17307.34 |               4767.78 |          9274.71 |            7247.42 |            3650.64 |     -50.88% |

## Notes

- `optimized` uses default runtime signature invalidation + dirty processing + JS precheck.
- `legacy` enables env toggles to emulate baseline behavior:
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`
