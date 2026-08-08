# Package Guidelines (`packages/lynx`)

## 适用范围

- 本文件适用于 `packages/lynx`。

## 核心职责

- 为 ReactLynx + Rspeedy 项目注册 weapp-tailwindcss 的 Rspack 构建器适配。
- Lynx 使用普通 CSS 与 `className`，不得引入运行时样式表、Babel JSX 改写或直接输出目录写入。

## 变更原则

- 固定使用 `platform: 'lynx'` 与 `generator.target: 'web'`，不要将小程序 CSS 转换带入 Lynx。
- 通过 Rspeedy/Rspack 生命周期修改构建图；CSS loader 调整必须保持幂等。

## 测试要求

- 覆盖插件注册、目标锁定与 Rspack CSS 规则补丁。
- 修改示例后运行其构建验证。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/lynx test`
- `pnpm --filter @weapp-tailwindcss/lynx build`
- `pnpm --filter @weapp-tailwindcss/example-react-lynx build`
