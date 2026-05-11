---
"weapp-tailwindcss": patch
---

修复 Webpack 生成模式在 MPX watch/HMR 场景下，仅脚本类名集合变化时可能复用旧 WXSS 缓存，导致脚本中新加的 Tailwind 工具类未生成样式的问题。

将 `demo/mpx-app` 的 script-only 新增类名回归纳入正式 watch-HMR 覆盖，并接入 `e2e:ci` 的稳定热更新门禁。
