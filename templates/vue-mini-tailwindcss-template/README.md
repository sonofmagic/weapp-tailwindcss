# vue-mini-tailwindcss-template

`vue-mini + weapp-vite + Tailwind CSS` 示例模板，当前已过时。

## 当前状态

> 该模板已过时，不建议继续作为新项目模板使用。
>
> 如果你需要基于 `weapp-vite` 的现代方案，并且希望直接使用 `Vue SFC`，请优先查看：<https://vite.icebreaker.top/>

## 适用场景

- 使用 `vue-mini` 开发微信小程序
- 希望用更轻量的 `weapp-vite` 工作流
- 需要生成页面 / 组件并快速验证样式转换

## 技术栈

- `vue-mini`
- `weapp-vite`
- `Tailwind CSS v3`
- `weapp-tailwindcss`
- `pnpm`

## 使用前提

- Node.js `>=18.19.1 <19` 或 `>=20.6.1`
- `pnpm`
- 微信开发者工具

## 快速开始

```bash
pnpm install
pnpm dev
```

## 常用命令

```bash
pnpm dev        # 启动开发
pnpm dev:open   # 启动并尝试打开开发者工具
pnpm build      # 构建
pnpm open       # 打开开发者工具
pnpm g path/to/component
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 通过 `weapp-vite generate` 生成页面或组件
- 适合验证 `vue-mini` 与 `weapp-tailwindcss` 的协作效果
- 新项目更推荐迁移到 `weapp-vite` 的 `Vue SFC` 方案：<https://vite.icebreaker.top/>

## 相关文档

- `vue-mini`：<https://vuemini.org/>
- `weapp-vite`：<https://ice-vite.netlify.app/>
- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
