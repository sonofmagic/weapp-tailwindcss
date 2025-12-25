---
sidebar: aiSidebar
title: Skill（技能系统）
---

# Skill（技能系统）

## 概述

**Skill** 是 Claude Code CLI 的**插件/技能系统**，允许开发者扩展 AI 助手的能力。每个 Skill 是一个独立的 npm 包，可以添加特定的功能、工作流或集成。

> **相关概念**：MCP 是协议，Skill 是实现。
> **插件市场**：[https://claude-plugins.dev](https://claude-plugins.dev)

---

## 核心概念

### 1. Skill 的定义

**Skill** 是 Claude Code 的功能扩展单元：

- 打包为 npm 包
- 包含特定的工具、工作流或代理
- 通过 `claude-plugins install` 安装
- 可与 Claude Code 深度集成

### 2. Skill 与 MCP 的关系

```
┌─────────────────────────────────────────────────────────┐
│              Claude Code 扩展体系                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Skill 系统                           │ │
│  │  ├── 高级封装（工作流、代理、专业功能）          │ │
│  │  ├── npm 包分发                                   │ │
│  │  ├── 配置驱动                                     │ │
│  │  └── 示例：PR Review Toolkit, Python Workflow   │ │
│  └───────────────────────────────────────────────────┘ │
│                         ▲                              │
│                         │ 可能使用                      │
│                         │                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │              MCP 协议                             │ │
│  │  ├── 底层协议                                     │ │
│  │  ├── 标准化数据传输                               │ │
│  │  ├── 语言无关                                     │ │
│  │  └── 示例：Filesystem Server, GitHub Server      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Skill 的类型

### 1. 工作流类 (Workflows)

提供特定开发场景的完整工作流：

| Skill | 功能 | 安装命令 |
| ----- | ---- | -------- |
| **Python Development** | Python 3.12+、Django、FastAPI | `npx claude-plugins install @wshobson/claude-code-workflows/python-development` |
| **JavaScript/TypeScript** | ES6+、Node.js、React | `npx claude-plugins install @wshobson/claude-code-workflows/javascript-typescript` |
| **Backend Development** | API 设计、GraphQL | `npx claude-plugins install @wshobson/claude-code-workflows/backend-development` |
| **Code Refactoring** | 代码清理、重构 | `npx claude-plugins install @wshobson/claude-code-workflows/code-refactoring` |
| **Developer Essentials** | Git、SQL、测试 | `npx claude-plugins install @wshobson/claude-code-workflows/developer-essentials` |

### 2. 工具包类 (Toolkits)

提供特定的工具集：

| Skill | 功能 | 安装命令 |
| ----- | ---- | -------- |
| **PR Review Toolkit** | 自动化代码审查 | `npx claude-plugins install @anthropics/claude-code-plugins/pr-review-toolkit` |
| **Document Skills** | Excel、Word、PDF 处理 | `npx claude-plugins install @anthropics/anthropic-agent-skills/document-skills` |

### 3. 综合类 (Comprehensive)

提供完整的企业级功能：

| Skill | 功能 | 安装命令 |
| ----- | ---- | -------- |
| **Claude Flow** | 150+ 命令、74+ 代理 | `npx claude-plugins install @ruvnet/claude-flow-marketplace/claude-flow` |
| **Frontend Excellence** | React 19、Next.js 15 | `npx claude-plugins install @dotclaude/dotclaude-plugins/frontend-excellence` |

---

## 使用 Skill

### 1. 安装 Skill

```bash
# 基本安装
npx claude-plugins install <package-name>

# 安装 Python 开发工作流
npx claude-plugins install @wshobson/claude-code-workflows/python-development

# 安装 PR 审查工具包
npx claude-plugins install @anthropics/claude-code-plugins/pr-review-toolkit
```

### 2. 列出已安装的 Skill

```bash
npx claude-plugins list
```

### 3. 卸载 Skill

```bash
npx claude-plugins uninstall <package-name>
```

### 4. 更新 Skill

```bash
npx claude-plugins update <package-name>
```

---

## 创建自定义 Skill

### 项目结构

```
my-custom-skill/
├── package.json
├── README.md
├── src/
│   ├── index.ts          # 入口文件
│   ├── tools/            # 工具定义
│   ├── agents/           # 代理定义
│   └── workflows/        # 工作流定义
└── dist/                 # 编译输出
```

### package.json

```json
{
  "name": "@myorg/my-custom-skill",
  "version": "1.0.0",
  "description": "My custom Claude Code skill",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": [
    "claude-code",
    "claude-plugin",
    "skill"
  ],
  "peerDependencies": {
    "@anthropic-ai/claude-code": "*"
  }
}
```

### 入口文件 (index.ts)

```typescript
import { defineSkill } from '@anthropic-ai/claude-code';

export default defineSkill({
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  description: 'A custom skill for my needs',

  // 定义工具
  tools: [
    {
      name: 'my-tool',
      description: 'Does something useful',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      },
      handler: async (params) => {
        return `Processed: ${params.input}`;
      }
    }
  ],

  // 定义代理
  agents: [
    {
      name: 'my-agent',
      description: 'Handles specific tasks',
      handler: async (context) => {
        // 代理逻辑
      }
    }
  ]
});
```

### 发布到 npm

```bash
# 构建
npm run build

# 发布
npm publish
```

---

## Skill 配置

### 配置文件位置

Claude Code 读取以下位置的配置：

```
~/.claude-code/
├── skills.json          # 已安装的技能列表
├── skills.config.json   # 技能配置
└── skills/              # 本地技能目录
```

### skills.config.json 示例

```json
{
  "enabledSkills": [
    "@wshobson/claude-code-workflows/python-development",
    "@anthropics/claude-code-plugins/pr-review-toolkit"
  ],
  "skillSettings": {
    "@wshobson/claude-code-workflows/python-development": {
      "pythonVersion": "3.12",
      "framework": "fastapi"
    }
  }
}
```

---

## 热门 Skill 推荐

### 1. PR Review Toolkit

**功能**：
- 自动化代码审查
- 测试覆盖率检查
- 错误处理验证
- 类型安全审查
- 代码质量评估

**适用**：团队协作、代码质量保证

### 2. Python Development Workflow

**功能**：
- Python 3.12+ 最佳实践
- Django/FastAPI 项目模板
- 异步编程模式
- 类型提示支持

**适用**：Python 开发者

### 3. JavaScript/TypeScript Workflow

**功能**：
- ES6+ 语法
- Node.js 开发
- React/Vue 框架
- 现代 Web 工具链

**适用**：前端/全栈开发者

### 4. Claude Flow

**功能**：
- 150+ 专业命令
- 74+ 专业代理
- GitHub 集成
- 企业级工作流

**适用**：企业团队

---

## Skill 与 MCP 的选择

| 场景 | 推荐方案 | 原因 |
| ---- | -------- | ---- |
| **标准化数据访问** | MCP | 跨平台兼容，协议标准 |
| **专业工作流** | Skill | 高级封装，开箱即用 |
| **自定义工具** | MCP | 灵活控制底层逻辑 |
| **团队协作** | Skill | 配置共享，版本管理 |
| **快速集成** | Skill | npm 安装，即插即用 |

---

## 参考资源

### 官方资源

- [Claude Code 插件文档](https://docs.anthropic.com/claude-code/plugins)
- [Claude Plugins 市场](https://claude-plugins.dev)

### 社区资源

- [Python Development Workflow](https://github.com/wshobson/claude-code-workflows)
- [PR Review Toolkit](https://github.com/anthropics/claude-code-plugins)
- [Claude Flow](https://github.com/ruvnet/claude-flow-marketplace)

---

**文档更新时间：2025 年 12 月**
