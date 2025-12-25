---
sidebar: aiSidebar
title: Spec-Driven Development（规范驱动开发）
---

# Spec-Driven Development（规范驱动开发）

## 概述

**Spec-Driven Development (SDD)** 或 **Spec-Driven Coding** 是一种**以规范（Specification）为先导**的软件开发方法论。开发者先编写详细的需求规范，然后由 AI 根据规范自动生成代码。

> **核心理念**：明确规范 → 自动实现 → 减少沟通成本

---

## 核心概念

### 1. 什么是 Spec（规范）

**Spec** 是对软件功能的**精确、可执行的描述**：

```markdown
# 用户登录功能规范

## 功能描述
用户可以使用邮箱和密码登录系统。

## 输入
- email: 字符串，符合邮箱格式
- password: 字符串，8-32位，包含字母和数字

## 输出
- 成功：返回用户信息和 JWT token
- 失败：返回错误信息

## 验证规则
- 邮箱必须已注册
- 密码必须正确
- 连续失败5次后锁定账户30分钟

## API 端点
POST /api/auth/login
```

### 2. Spec-Driven vs 传统开发

| 开发方式 | 流程 | 优势 | 劣势 |
| -------- | ---- | ---- | ---- |
| **传统开发** | 需求 → 设计 → 编码 | 灵活 | 沟通成本高 |
| **Spec-Driven** | 规范 → AI 生成代码 | 自动化、可追溯 | 需要编写规范 |
| **敏捷开发** | 用户故事 → 迭代 | 快速响应 | 文档缺失 |

---

## Spec-Driven Development 的流程

```
┌─────────────────────────────────────────────────────────┐
│              Spec-Driven Development 流程                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 需求收集                                           │
│     │                                                   │
│     ▼                                                   │
│  2. 编写规范 (Spec)        ┌─────────────────┐          │
│     │                     │  自然语言规范    │          │
│     ├────────────────────▶│  API 规范       │          │
│     │                     │  数据模型规范   │          │
│     │                     │  UI 规范        │          │
│     │                     └─────────────────┘          │
│     │                                                   │
│     ▼                                                   │
│  3. AI 代码生成         ┌─────────────────┐          │
│     │                     │ Claude Code     │          │
│     ├────────────────────▶│ Cursor Agent    │          │
│     │                     │ Qoder Spec Mode │          │
│     │                     └─────────────────┘          │
│     │                                                   │
│     ▼                                                   │
│  4. 代码审查                                           │
│     │                                                   │
│     ▼                                                   │
│  5. 测试验证                                           │
│     │                                                   │
│     ▼                                                   │
│  6. 部署上线                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Spec 的类型

### 1. 功能规范

描述软件应该做什么：

```markdown
## 功能：用户注册

### 需求
用户可以注册新账户

### 输入字段
- username: 3-20字符，字母数字下划线
- email: 有效的邮箱地址
- password: 最少8位，必须包含大小写字母和数字

### 业务规则
- 用户名必须唯一
- 邮箱必须未被注册
- 注册后自动发送验证邮件
```

### 2. API 规范

描述 API 接口：

```yaml
# OpenAPI 规范
openapi: 3.0.0
info:
  title: 用户认证 API
  version: 1.0.0

paths:
  /auth/login:
    post:
      summary: 用户登录
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: 登录成功
```

### 3. 数据模型规范

描述数据结构：

```typescript
// TypeScript 接口规范
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

### 4. UI 规范

描述界面要求：

```markdown
## 登录页面 UI 规范

### 布局
- 居中卡片式布局
- 宽度 400px

### 组件
- 邮箱输入框
- 密码输入框（带显示/隐藏切换）
- "记住我" 复选框
- "忘记密码" 链接
- 登录按钮

### 样式
- 主色调：#3B82F6
- 圆角：8px
- 阴影：0 4px 6px rgba(0,0,0,0.1)
```

---

## 支持 Spec-Driven 的工具

### 1. Qoder Spec Mode

Qoder 的**规范驱动编程**功能：

```
┌─────────────────────────────────────────────────────────┐
│                    Qoder Spec Mode                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 用户输入自然语言需求                                │
│     "创建一个用户登录页面，支持邮箱和密码登录"          │
│                                                         │
│  2. Qoder 自动生成规范                                  │
│     ├── 功能分析                                        │
│     ├── 数据模型                                        │
│     ├── API 设计                                        │
│     └── UI 规范                                         │
│                                                         │
│  3. 用户确认/修改规范                                   │
│                                                         │
│  4. Qoder 根据规范生成代码                              │
│     ├── 前端组件                                        │
│     ├── 后端接口                                        │
│     └── 数据库设计                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Cursor Composer

Cursor 的多步骤任务执行：

```typescript
// 用户输入
"实现用户认证功能，包含注册、登录、登出"

// Cursor 自动规划
1. 分析需求 → 生成规范
2. 设计数据模型
3. 实现 API 端点
4. 创建 UI 组件
5. 编写测试用例
```

### 3. Claude Code CLI

通过 CLAUDE.md 定义规范：

```markdown
# 项目规范

## 编码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式声明

## API 规范
- RESTful 风格
- 统一错误处理
- JWT 认证

## 测试规范
- 单元测试覆盖率 > 80%
- 使用 Vitest
```

---

## Spec 编写最佳实践

### 1. SMART 原则

| 原则 | 说明 | 示例 |
| ---- | ---- | ---- |
| **Specific** | 具体明确 | "用户可以登录" 而非 "实现认证" |
| **Measurable** | 可衡量 | "密码8-32位" 而非 "密码足够复杂" |
| **Achievable** | 可实现 | 考虑技术限制 |
| **Relevant** | 相关性 | 与业务目标一致 |
| **Time-bound** | 有时限 | "在2秒内完成" |

### 2. 结构化规范

```markdown
## 功能概述
一句话描述功能

## 用户故事
作为 [角色]，我想要 [功能]，以便 [目的]

## 验收标准
- [ ] 场景1：描述
- [ ] 场景2：描述

## 技术规范
### 数据模型
### API 接口
### 业务逻辑

## 非功能需求
### 性能：响应时间 < 200ms
### 安全：HTTPS + JWT
### 兼容：支持主流浏览器
```

### 3. 使用规范语言

- 使用**自然语言**但保持结构化
- 避免歧义词汇（"尽可能"、"大概"）
- 使用**具体数字**（"3次"而非"多次"）
- 包含**边界条件**（"空值"、"超长输入"）

---

## Spec-Driven vs 其他开发方式

### Spec-Driven vs Vibe Coding

| 维度 | Spec-Driven | Vibe Coding |
| ---- | ----------- | ----------- |
| **规划** | 详细规范 | 随性发挥 |
| **可追溯** | 高 | 低 |
| **团队协作** | 容易 | 困难 |
| **AI 参与** | 核心 | 辅助 |
| **适用场景** | 大型项目、团队 | 原型、个人项目 |

### Spec-Driven vs Test-Driven Development

| 维度 | Spec-Driven | TDD |
| ---- | ----------- | --- |
| **起点** | 规范 | 测试 |
| **顺序** | 规范 → 代码 → 测试 | 测试 → 代码 |
| **AI 友好** | 是 | 否 |
| **可组合** | 可组合 | 相对独立 |

---

## 实施建议

### 1. 规范模板

```markdown
# [功能名称] 规范

## 背景
为什么需要这个功能

## 目标
这个功能要达到什么效果

## 功能描述
详细的功能说明

## 验收标准
如何判断功能完成

## 技术考虑
- 性能要求
- 安全考虑
- 兼容性要求

## 依赖
依赖的其他功能或模块
```

### 2. 工具配置

```json
// .claude/spec-template.json
{
  "template": "# 功能规范\n\n## 功能概述\n{summary}\n\n## 需求\n{requirements}\n\n## 验收标准\n{acceptance}",
  "requiredFields": ["summary", "requirements"],
  "outputFormat": "markdown"
}
```

### 3. 版本管理

```
specs/
├── v1.0/
│   ├── auth-spec.md
│   ├── user-spec.md
│   └── api-spec.md
├── v1.1/
│   ├── auth-spec.md (更新)
│   └── payment-spec.md (新增)
```

---

## 参考资源

### 相关工具

- [Qoder Spec Mode](https://docs.qoder.com/spec-driven-programming)
- [Cursor Composer](https://cursor.com/docs/composer)
- [OpenAPI Specification](https://swagger.io/specification/)

### 相关方法论

- [Behavior-Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development)
- [Feature-Driven Development (FDD)](https://en.wikipedia.org/wiki/Feature-driven_development)

---

**文档更新时间：2025 年 12 月**
