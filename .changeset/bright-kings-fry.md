---
"weapp-tailwindcss": patch
---

修复 Vite + uni-app 场景下的 HMR 类名漏转译问题，并增强 JS 转译鲁棒性：

- 修复 `generateBundle` 阶段 runtime class set 失效策略：当 `html/js` 源码发生变化时强制刷新 runtimeSet，不再只依赖 `tailwind.config` 签名，避免新增 arbitrary value 在热更新后漏转义。
- 为 Vite JS 处理链路补充 `staleClassNameFallback` 策略（`serve` 与 `build --watch` 默认开启），并新增 `UserDefinedOptions.staleClassNameFallback` 供用户显式配置。
- 补充对应回归测试：覆盖“静态 class -> `:class` 常量字符串（包含新增 arbitrary value）”的热更新场景，并验证 `jsPreserveClass` 可避免业务字符串误转义。
