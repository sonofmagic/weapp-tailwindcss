# uni-app-vue2-tailwind-vscode-template

`uni-app + Vue 2 + Tailwind CSS` 的 VS Code 模板，当前已过时。

## 当前状态

> 该模板已过时，适合维护存量项目，不建议继续作为新项目模板使用。

## 适用场景

- 维护 `Vue 2` 时代的 `uni-app` 项目
- 希望继续在 VS Code 中完成小程序开发
- 需要保留 `weapp-tailwindcss` 的接入方式

更推荐直接使用：

- `uni-app-vite-vue3-tailwind-vscode-template`
- `uni-app-tailwindcss-v4`
- `uni-app-vue3-tailwind-hbuilder-template`

## 技术栈

- `uni-app`
- `Vue 2`
- `Tailwind CSS v3`
- `weapp-tailwindcss`
- `yarn`

## 使用前提

- Node.js `20.19+`
- `yarn`
- 微信开发者工具

## 快速开始

```bash
yarn
yarn dev:mp-weixin
```

如果需要直接打开微信开发者工具：

```bash
yarn open:dev
```

## 常用命令

```bash
yarn dev:mp-weixin
yarn build:mp-weixin
yarn open:dev
yarn open:build
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 该模板面向 `Vue 2` 存量项目，不建议作为新项目默认起点
- `uni-app` 依赖升级可使用 `yarn up:uni-app`

## 相关文档

- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
- `uni-app`：<https://uniapp.dcloud.net.cn/>
