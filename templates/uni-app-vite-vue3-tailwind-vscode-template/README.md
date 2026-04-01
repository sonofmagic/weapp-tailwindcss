# uni-app-vite-vue3-tailwind-vscode-template

`uni-app + Vite + Vue 3 + Tailwind CSS` 的 VS Code 模板。

## 适用场景

- 使用 `uni-app` 的 `Vite` 方案开发多端项目
- 主目标是微信小程序，同时希望保留 H5 / App 等端能力
- 需要 `Vue 3`、`Pinia`、自动导入和 `weapp-tailwindcss` 集成

## 技术栈

- `uni-app`
- `Vite`
- `Vue 3`
- `Tailwind CSS v3`
- `weapp-tailwindcss`
- `pnpm`

## 使用前提

- Node.js `22+`
- `pnpm`
- 微信开发者工具

## 快速开始

```bash
pnpm install
pnpm dev:mp-weixin
```

如果需要直接打开微信开发者工具：

```bash
pnpm open:dev
```

## 常用命令

```bash
pnpm dev:mp-weixin
pnpm build:mp-weixin
pnpm dev:h5
pnpm build:h5
pnpm open:dev
pnpm open:build
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 请先把 `src/manifest.json` 中的 `appid` 改成你自己的
- 模板内保留了 `up:pkg` 和 `up:uniapp`，用于分别升级通用依赖和 `uni-app` 依赖
- 推荐在 VS Code 中安装 `Tailwind CSS IntelliSense`、`ESLint`、`Stylelint`

## 项目级技能

仓库已内置项目级 `uni-app` skill，供 Codex 等 agent 在当前项目内直接复用：

- 技能目录：`.agents/skills/uni-app`
- 锁文件：`skills-lock.json`
- 技能入口：`.agents/skills/uni-app/SKILL.md`

这个仓库只保留最小集合，不提交 `.claude/`、`.continue/`、`skills/` 这类兼容性符号链接目录。

## 相关文档

- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
- `uni-app`：<https://uniapp.dcloud.net.cn/>
