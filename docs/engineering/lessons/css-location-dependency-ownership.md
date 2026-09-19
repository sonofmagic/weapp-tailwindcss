---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1217
baseline: 2fc66317e6783fa085e5f8e631568ee93b67a57e
regressions:
  - packages/postcss/test/syntax-location-dependencies.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-css-location-analysis.test.ts
  - packages/weapp-tailwindcss/test/ci/architecture-contract.test.ts
---

# CSS 位置依赖判断的归属与转义边界

## 症状

主包缓存共享范围使用正则查找 `url(...)` 和 `@import`。直接调用发现合法 CSS `u\72l(./icon.svg)` 与 `@\69mport "./dep.css"` 被判为全局共享，不同目录得到相同缓存范围。字符串或注释中的 `url` / `@import` 又被错误判为目录相关，减少了可复用缓存。

## 根因与纠正

正则匹配未解码 CSS 标识符，也未区分 token 与字面文本。将该语法判断迁入 PostCSS，使用已有 CSS tokenizer 的流式接口读取解码后的 URL、函数和 at-keyword；相对资源或 import 一经确认即返回，不分配完整 token 数组。
路径解析、主样式特例及缓存 key 仍由主包负责，没有将构建图或文件系统职责迁入 PostCSS。
无 `@`、反斜杠和 `url(` 的源码不可能包含被检查的两类语法，直接返回；未知 URL 参数和 tokenizer 解析错误保守使用目录隔离。

## 验证

- 新增主包 5 个回归在旧实现上全部失败；迁移后主包位置分析、原有 helper、架构契约共 15 项通过。
- PostCSS 新增 25 项用例，覆盖转义函数名和 import、绝对/相对 URL、字符串、注释、嵌套函数及非法 URL。
- `CI=1 pnpm --filter @weapp-tailwindcss/postcss test --update=none`：95 文件、901 通过、3 个既有跳过；两包独立构建、改动 TS 的 ESLint 及 `pnpm agents:check` 通过。
- `CI=1 pnpm --filter @weapp-tailwindcss/postcss exec vitest bench test/syntax-location-dependencies.bench.ts --run` 保留快路径、提前返回和完整扫描三类基准。

独立微基准使用 1,000 条普通规则，各预热 20 次，交替采样 30 组，每组 100 次，取中位数。旧/新耗时：无资源语法 0.0050 / 0.0011 ms；开头相对 URL 0.0017 / 0.0008 ms；末尾绝对 URL 0.0050 / 0.7109 ms。完整 tokenizer 分析更慢，不能只报告快路径改善，也不能推算真实构建收益。框架端到端缓存输出与性能仍需补充，本记录保持 partial。

## 适用边界

本次覆盖原有 url/import 位置判断，不是对所有未来 CSS 资源语法的完整实现。无 demo、IDE 用例或样式输出预期修改，不更新 static 基线。跨目录测试使用平台路径 API，不引入本机绝对路径。

## 规则评估

不新增 AGENTS。沿用 CSS 语法由 PostCSS 统一拥有的规则，将缓存范围入口纳入架构契约。
