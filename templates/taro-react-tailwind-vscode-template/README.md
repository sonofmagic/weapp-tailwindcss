# taro-react-tailwind-vscode-template

`Taro + React + Tailwind CSS` 的 VS Code 模板，适合微信小程序日常开发。

## 适用场景

- 使用 `React` 开发 `Taro` 小程序项目
- 需要在 VS Code 中完成主要开发流程
- 想直接使用 `weapp-tailwindcss` 的补丁与转换能力

## 技术栈

- `Taro React`
- `Tailwind CSS v3`
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

然后把 `project.config.json` 中的 `appid` 改成你自己的小程序 `appid`，再用微信开发者工具导入当前目录。

## 常用命令

```bash
pnpm dev:weapp
pnpm build:weapp
pnpm build:h5
pnpm open
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 如使用微信开发者工具，建议关闭 IDE 自带代码热重载，避免和构建侧监听冲突
- 其他端构建命令已保留在 `package.json` 中，可按需使用

## 相关文档

- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
- `Taro`：<https://taro.zone/>
