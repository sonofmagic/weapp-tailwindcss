# Vite Dev HMR Performance Summary

Generated at: 2026-02-10T06:36:49.007Z

| Metric    | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |
| --------- | ------------------: | --------------------: | --------------------: | ---------------: | -----------------: | -----------------: | ----------: |
| startupMs |             4513.00 |               4463.00 |                 88.98 |          4309.67 |            4198.00 |             159.34 |      -4.72% |
| hmrMs     |             1077.29 |               1013.03 |                 95.28 |          1214.06 |            1214.48 |              82.25 |      11.26% |

## Notes

- `optimized` uses runtime signature invalidation + dirty processing + JS precheck.
- `legacy` enables env toggles to emulate baseline behavior:
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`
