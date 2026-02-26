---
sidebar: aiSidebar
title: Skill（技能系统）
description: Skill 是一组可复用的执行规则与工作流，用来让 AI 在特定任务中更稳定地输出结果。
keywords:
  - AI 编程
  - LLM
  - 工作流
  - Skill
  - 技能系统
  - ai
  - basics
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---

# Skill（技能系统）

## 概述

Skill 是一组可复用的执行规则与工作流，用来让 AI 在特定任务中更稳定地输出结果。

`weapp-tailwindcss` 提供的 Skill 目标是帮助用户在自己的业务项目中，快速接入并稳定使用 `weapp-tailwindcss`，用于小程序与多端开发。

> 这个 Skill 主要服务“项目使用者”，不是仓库二次开发维护指南。

在本项目中，我们采用 [`vercel-labs/skills`](https://github.com/vercel-labs/skills) 安装 Skill，技能文件为 `SKILL.md`。

## weapp-tailwindcss Skill 安装

### 1. 从 GitHub 安装（推荐）

```bash
npx skills add sonofmagic/weapp-tailwindcss --skill weapp-tailwindcss
```

### 2. 查看仓库可安装 Skill 列表

```bash
npx skills add sonofmagic/weapp-tailwindcss --list
```

### 3. 本地开发时安装当前目录 Skill

在本仓库根目录执行：

```bash
npx skills add . --skill weapp-tailwindcss
```

## 装完后能做什么

安装后，你可以让 AI 按你的项目类型直接产出可运行配置，例如：

- `uni-app cli vue3 vite` 项目接入方案
- `taro webpack5` / `taro vite` 项目接入方案
- `uni-app x` 同时构建 `Web` / 小程序 / `Android` / `iOS` / 鸿蒙
- 已有项目迁移、样式失效排障、`rpx` 任意值问题定位
- Tailwind 写法规范沉淀（含 `space-y-*` / `space-x-*` 在小程序端的标签限制与修复顺序）

Skill 会要求 AI 优先完成这些关键动作：

- 识别你当前框架和目标端
- 补齐 `tailwindcss` 与 `weapp-tailwindcss` 最小可用配置
- 明确 `postinstall` 中的 `weapp-tw patch`
- 给出“可复制命令 + 可复制配置 + 验证步骤”
- 对 `space-y-*` / `space-x-*` 问题按固定优先级排查：先改结构，再评估 `virtualHost`，最后扩展 `cssChildCombinatorReplaceValue`

## 写法规范补充：space-y / space-x

在小程序里，`space-y-*`、`space-x-*` 这类依赖子组合器的工具类，默认不是“全标签通用”，通常会按 `view + view`（含 `text`）处理。

如果你遇到 `space-y-2` 不生效，建议按下面顺序处理：

1. 先改结构：让相邻子节点落在 `view/text`，或外层包一层 `view`
2. 再评估组件层：自定义组件场景启用 `virtualHost`
3. 最后改配置：仅在必要时扩展 `cssChildCombinatorReplaceValue`，并保持最小化标签范围

## 推荐提示词

1. 新项目快速接入

```text
我现在是 uni-app cli vue3 vite 项目，目标端是微信小程序 + H5。
请按 weapp-tailwindcss skill 给我最小可用配置，
输出需要包含：安装命令、完整配置文件、验证步骤。
```

2. 旧项目迁移

```text
这是一个 taro webpack5 老项目，已经有 tailwindcss 但样式经常丢失。
请按 weapp-tailwindcss skill 给迁移方案，并列出最小改动清单。
```

3. 问题排查

```text
我在 JS 字符串里写了 tailwind 任意值 class，但小程序端不生效。
请按 weapp-tailwindcss skill 给排查顺序，并指出应该检查的配置项。
```

4. `space-y` / `space-x` 不生效排查

```text
我的容器写了 space-y-2，但子节点是 button 和自定义组件，间距没有生效。
请按 weapp-tailwindcss skill 给固定优先级排查方案，并给出最小改动配置。
```

## Skill 文件位置

```text
skills/weapp-tailwindcss/SKILL.md
```

## 常见问题

### 安装后看不到 Skill

排查顺序：

1. 先执行 `npx skills add <repo> --list` 确认技能名。
2. 确认安装命令中的 `--skill weapp-tailwindcss` 名称完全一致。
3. 确认默认分支已包含 `skills/weapp-tailwindcss/SKILL.md`。

### 我是 Skill 维护者，如何发布版本

请查看：[Skill 发布与版本化](/docs/ai/basics/skill-release)
