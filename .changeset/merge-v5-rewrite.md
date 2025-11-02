---
"@weapp-tailwindcss/merge": major
---

- 使用 `@weapp-core/escape` 的 `escape`/`unescape` 重写运行时，默认归一化并重转义类名，废弃旧的 `disableEscape` 与 `escapeFn`。
- 新增 `escape`/`unescape` 配置及共享的 transformers，让 `twMerge`/`twJoin`/`createTailwindMerge`、`cva` 与新的 `variants` 入口保持一致逻辑。
- 发布 `@weapp-tailwindcss/merge/variants`，包装 `tailwind-variants` 以适配小程序场景并自动调用 weapp 转义。
- 完成 core、cva、v3/v4 运行时与 variants 的全覆盖单测，锁定破坏性行为。
