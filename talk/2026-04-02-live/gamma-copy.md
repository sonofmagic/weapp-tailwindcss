# Gamma / Canva 单页块文案

## 使用说明

这份文档适合直接复制到：

- Gamma
- Canva Docs / Presentation
- Keynote 大纲模式
- Figma Slides 文案区

写法特点：

- 每一页是一个独立内容块
- 标题、副标题、要点已经拆好
- 你可以一块一块直接复制

---

## Page 1

Title:
小程序还能这么写？

Subtitle:
AI 出样式，Tailwind 跑全端

Body:
- 一句话描述界面
- AI 生成 Tailwind 类名
- `weapp-tailwindcss` 自动转译
- 小程序直接预览

Speaker note:
先打主题，不先讲细节。

---

## Page 2

Title:
灵魂拷问

Subtitle:
你到底花了多少时间在写样式？

Body:
- 上周写了多少行样式？
- 花了多少时间调 `margin / padding / radius / shadow`？
- 你是在写业务，还是在做像素搬运？

Speaker note:
让观众先代入自己的痛点。

---

## Page 3

Title:
为什么小程序样式开发一直慢

Subtitle:
旧范式天然低效

Body:
- 表达成本高
- 试错成本高
- 跨端一致性差
- 反馈链路长

Speaker note:
把问题升级成“工作流问题”。

---

## Page 4

Title:
旧范式 vs 新范式

Subtitle:
从“手写属性”切到“表达意图”

Body:
- 旧：先想 CSS 属性
- 新：先想界面意图
- 旧：人肉反复试错
- 新：AI 先给可运行起点

Speaker note:
这页是全场最关键的认知切换。

---

## Page 5

Title:
先看结果

Subtitle:
一句话，AI 出一版卡片样式

Body:
- 渐变卡片
- 大圆角
- 柔和阴影
- 标题 / 副标题 / CTA

Speaker note:
这里后面立刻接现场 Demo。

---

## Page 6

Title:
为什么是 Tailwind

Subtitle:
Tailwind 是更适合 AI 的样式语言

Body:
- 可枚举
- 可组合
- 可约束
- 输出更稳定

Speaker note:
不要讲成“Tailwind 万能”，而是讲“更适合 AI”。

---

## Page 7

Title:
三层模型

Subtitle:
意图 -> 原子类 -> 小程序适配

Body:
- 你：描述界面意图
- AI：生成 Tailwind 类名
- `weapp-tailwindcss`：翻译成小程序结果

Speaker note:
把整条链路讲简单。

---

## Page 8

Title:
`weapp-tailwindcss` 在做什么

Subtitle:
不只是插件，而是一条工程链路

Body:
- Tailwind 小程序全方面解决方案
- 多构建工具基底支持
- 多框架、多端能力

Speaker note:
这一页承上启下，转到仓库全景。

---

## Page 9

Title:
支持范围

Subtitle:
覆盖主流小程序开发路线

Body:
- `webpack`
- `vite`
- `rspack`
- `rollup`
- `rolldown`
- `gulp`

Speaker note:
口播时补一句：这里说的是构建工具基底。

---

## Page 10

Title:
仓库不是 PPT 工程

Subtitle:
它同时有 demo、templates、Skill、E2E、benchmark

Body:
- `demo/*`
- `templates.jsonc`
- `skills/weapp-tailwindcss`
- watch / HMR 回归
- framework benchmark

Speaker note:
这页用来建立可信度。

---

## Page 11

Title:
主 Demo 选型

Subtitle:
`demo/uni-app-tailwindcss-v4`

Body:
- 直观
- 稳定
- 贴近日常业务
- 适合直播

Speaker note:
后面开始切代码。

---

## Page 12

Title:
关键配置 1

Subtitle:
`postinstall: "weapp-tw patch"`

Body:
- patch 链路不能漏
- 任意值问题常和它有关
- JS 字符串 class 也和它有关

Speaker note:
很多坑的根在 patch。

---

## Page 13

Title:
关键配置 2

Subtitle:
`vite.config.ts`

Body:
- `uni()`
- Tailwind 插件
- `UnifiedViteWeappTailwindcssPlugin`

Speaker note:
讲清楚“Tailwind 后面还有一层适配”。

---

## Page 14

Title:
关键配置 3

Subtitle:
`src/main.css`

Body:
- Tailwind 入口
- 主题变量
- 配置承载点

Speaker note:
让观众知道这不是传统业务 CSS 文件。

---

## Page 15

Title:
AI Skill

Subtitle:
让 AI 不只是写代码，而是按流程做事

Body:
- 先收集上下文
- 再输出配置
- 再给验证步骤
- 再给回滚方案

Speaker note:
这是“AI 工程化”的关键页。

---

## Page 16

Title:
Skill 先问什么

Subtitle:
最小上下文决定方案质量

Body:
- 框架
- 构建器
- 目标端
- Tailwind 版本
- 包管理器

Speaker note:
要强调上下文不完整时 AI 很容易漏风。

---

## Page 17

Title:
Skill 输出什么

Subtitle:
不是一段代码，而是一套落地结果

Body:
- 修改文件清单
- 可复制配置
- 安装命令
- 验证步骤
- 回滚方案

Speaker note:
这页打团队价值感。

---

## Page 18

Title:
进阶技巧

Subtitle:
这些地方最容易踩坑

Body:
- 任意值与 `rpx`
- 动态 class 要枚举
- `space-y / space-x`
- `twMerge / cva / cn`
- `uni-app x`

Speaker note:
作为一个总览页使用。

---

## Page 19

Title:
工程信号

Subtitle:
从“能跑”走向“可验证”

Body:
- HMR 报告
- framework benchmark
- 用数据讨论体验

Speaker note:
不用讲太细，重点是说明仓库在认真做工程化。

---

## Page 20

Title:
最后一句话

Subtitle:
别再把样式开发当体力活

Body:
- AI 写意图
- Tailwind 做语言
- `weapp-tailwindcss` 负责翻译
- 从下一个页面开始试

Speaker note:
结尾引导试用、Star、预告下一场。

