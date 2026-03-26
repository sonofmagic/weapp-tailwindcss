# taro-webpack-tailwindcss-v4

`Taro + webpack + React + Tailwind CSS v4` 模板。

## 适用场景

- 需要在 `Taro webpack` 体系下接入 `Tailwind CSS v4`
- 希望保留传统 webpack 构建链路
- 需要一个用于兼容验证或迁移参考的模板

## 技术栈

- `Taro React`
- `webpack`
- `Tailwind CSS v4`
- `weapp-tailwindcss`
- `pnpm`

## 使用前提

- Node.js `20.19+`
- `pnpm`
- 微信开发者工具

## 快速开始

```bash
pnpm install
pnpm dev:weapp
```

## 常用命令

```bash
pnpm dev:weapp
pnpm build:weapp
pnpm build:h5
pnpm open
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 这是 webpack 方案，不同于 `taro-vite-tailwindcss-v4`
- 适合存量项目对照或 CI 兼容回归

## 相关文档

- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
- `Taro`：<https://taro.zone/>
