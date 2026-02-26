---
sidebar: aiSidebar
title: Skill 发布与版本化
description: 本页面面向 weapp-tailwindcss Skill 维护者，说明如何做版本管理、打 tag、发 release，并保持安装指令稳定可用。
keywords:
  - AI 编程
  - LLM
  - 工作流
  - Skill
  - 发布与版本化
  - ai
  - basics
  - skill release
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---

# Skill 发布与版本化

本页面面向 `weapp-tailwindcss` Skill 维护者，说明如何做版本管理、打 tag、发 release，并保持安装指令稳定可用。

## 适用对象

- 维护 `skills/weapp-tailwindcss/SKILL.md` 的仓库维护者
- 需要在 AI 学习中心持续展示可用安装命令的文档维护者

## 发布前检查

1. 确认技能文件已更新

```text
skills/weapp-tailwindcss/SKILL.md
```

2. 本地校验技能可被发现

```bash
npx skills add . --list
```

3. 本地校验技能可被安装

```bash
npx skills add . --skill weapp-tailwindcss
```

4. 校验 AI 学习中心文档已同步

- `website/docs/ai/basics/skill.md`
- `README.md`

## 推荐版本策略

- 使用独立语义化版本 tag 管理 Skill 变更，例如 `skill-weapp-tailwindcss-v1.0.0`
- 变更类型建议：
  - Patch：文案修订、轻微流程修正
  - Minor：新增框架支持或新增标准排障流程
  - Major：删除旧流程或发生不兼容调整

## 发布流程（tag + GitHub Release）

1. 提交并推送代码

```bash
git checkout main
git pull --rebase
git add skills/weapp-tailwindcss/SKILL.md website/docs/ai/basics/skill.md README.md
git commit -m "docs(skill): 更新 weapp-tailwindcss 用户技能"
git push origin main
```

2. 创建并推送 tag

```bash
git tag -a skill-weapp-tailwindcss-v1.0.0 -m "release: weapp-tailwindcss skill v1.0.0"
git push origin skill-weapp-tailwindcss-v1.0.0
```

3. 创建 GitHub Release（任选一种）

- Web UI：在 GitHub 仓库的 Releases 页面基于上述 tag 创建
- `gh` CLI：

```bash
gh release create skill-weapp-tailwindcss-v1.0.0 \
  --title "weapp-tailwindcss skill v1.0.0" \
  --notes "更新内容：补充多端项目接入流程与排障提示。"
```

## AI 学习中心展示规范

为了降低用户学习成本，安装命令建议保持固定：

```bash
npx skills add sonofmagic/weapp-tailwindcss --skill weapp-tailwindcss
```

每次 Skill 行为发生变更时，同步更新以下入口：

- `website/docs/ai/basics/skill.md`
- `website/docs/ai/index.md`
- `README.md`

