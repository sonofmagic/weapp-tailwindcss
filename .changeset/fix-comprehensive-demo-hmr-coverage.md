---
"weapp-tailwindcss": patch
---

补全面向 demo 的热更新回归覆盖，修复 Vite watch 下样式源刷新不及时的问题，并调整 Taro Web/H5 与 Webpack demo 的 HMR 断言，使小程序端、H5 端、正常开发和热更新场景都能稳定通过。
