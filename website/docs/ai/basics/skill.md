---
sidebar: aiSidebar
title: Skill（技能系统）
---

# Skill（技能系统）

## 概述

Skill 是一组可复用的执行规则与工作流，用来让 AI 在特定仓库中更稳定地完成任务。

在本项目中，我们采用 [`vercel-labs/skills`](https://github.com/vercel-labs/skills) 的安装方式，Skill 文件以 `SKILL.md` 形式存在于仓库中。

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

## Skill 文件位置

本仓库 Skill 位于：

```text
skills/weapp-tailwindcss/SKILL.md
```

其核心目标：

- 为 `weapp-tailwindcss` 单仓库任务提供统一执行约束
- 固化目录级 AGENTS 规则读取顺序
- 提供标准构建/测试命令与高风险链路注意事项

## 适用场景

- 在 `packages/*` 中修改核心能力并做回归验证
- 在 `website/*` 中更新 AI/文档内容并保持构建可用
- 在 `e2e/*` 中补充场景测试并同步验证命令
- 在跨包改动时，保持提交范围清晰且符合 Conventional Commits

## 常见问题

### 安装后看不到 Skill

排查顺序：

1. 先执行 `npx skills add <repo> --list` 确认技能名。
2. 确认安装命令里的 `--skill weapp-tailwindcss` 名称完全一致。
3. 确认当前仓库已经推送到远端，且 `skills/weapp-tailwindcss/SKILL.md` 在默认分支可见。

### 什么时候要更新 Skill

当以下内容变化时建议同步更新：

- 仓库目录结构和职责边界
- 构建/测试主命令
- 高风险规则（例如 JS 转译约束）
- 提交规范与发布前检查流程
