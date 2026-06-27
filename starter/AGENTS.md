# Starter Guidelines (starter/*)

## 适用范围

- 本文件适用于 `starter/*`。
- starter 是按公开新手教程维护的最小可运行项目，用于验证用户照文档接入 `weapp-tailwindcss` 时能跑通。

## 变更原则

- 保持配置尽量少，只保留框架运行和 `weapp-tailwindcss` 必需项。
- Tailwind CSS v4 样式生成必须由 `weapp-tailwindcss` 接管，禁止注册 `@tailwindcss/postcss`、`@tailwindcss/vite` 或 Tailwind 官方 PostCSS 生成插件。
- Tailwind 入口放在纯 CSS 文件，源码扫描优先使用 `@source`。
- starter 作为 monorepo workspace 项目维护，不提交独立 `pnpm-lock.yaml`。

## 测试要求

- 每个 starter 至少覆盖基础 utility、rpx 任意值和一个变体/伪类类名。
- 新增或改动 starter 时，同步更新 `e2e/starter-build-smoke.test.ts` 的构建与产物断言。
