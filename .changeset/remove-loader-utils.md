---
"weapp-tailwindcss": patch
---

移除 webpack loader 对 `loader-utils` 的依赖，改为使用 webpack 5 loader context 的 `getOptions()` 读取配置。
