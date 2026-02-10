# Vite Dev HMR Performance Summary

Generated at: 2026-02-10T06:38:08.507Z

| Metric    | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |
| --------- | ------------------: | --------------------: | --------------------: | ---------------: | -----------------: | -----------------: | ----------: |
| startupMs |             6429.33 |               6237.00 |                332.42 |          5907.33 |            5614.00 |             434.79 |      -8.84% |
| hmrMs     |             2166.89 |               2125.53 |                131.16 |          2359.87 |            2036.72 |             460.43 |       8.18% |

## Notes

- `optimized` uses runtime signature invalidation + dirty processing + JS precheck.
- `legacy` enables env toggles to emulate baseline behavior:
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`
