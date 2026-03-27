# PPT 页码对应讲稿

## 使用说明

这份文档按 PPT 页码组织。

建议搭配 20 页左右的 PPT 使用。  
每一页都给出：

- 本页标题
- 本页要讲的话
- 本页停留时间
- 是否需要切代码或切 Demo

---

## 第 1 页 标题页

### 标题

小程序还能这么写？AI 出样式，Tailwind 跑全端

### 要讲的话

大家晚上好，今天这场直播的主题是“小程序还能这么写？AI 出样式，Tailwind 跑全端”。

今天我想做的事情很简单，证明给大家看：  
小程序样式开发，不应该再是手写一堆 `rpx` 和传统 CSS 的体力活。  
我们完全可以用一句话描述界面，让 AI 先生成 Tailwind 类名，再让 `weapp-tailwindcss` 负责适配，最后直接在小程序里看到结果。

### 停留时间

1 分钟

### 操作

无

---

## 第 2 页 灵魂拷问

### 要讲的话

我先问大家三个问题。

你上周写了多少行样式？  
你有多少时间花在调间距、调圆角、调阴影、调字号？  
你有没有感觉，自己很多时候像是在做像素搬运工？

尤其是小程序场景，这种感觉会更强。  
因为除了样式本身，还有平台差异、单位适配、构建工具、多端一致性这些问题。

### 停留时间

2 分钟

### 操作

可与观众互动

---

## 第 3 页 传统链路为什么慢

### 要讲的话

小程序样式开发慢，我觉得核心有三点：

1. 表达成本高
2. 试错成本高
3. 跨端一致性差

你脑子里想的是一个界面，手上写出来的是一堆分散属性。  
这个过程天然就很低效。

### 停留时间

2 分钟

### 操作

无

---

## 第 4 页 新范式

### 要讲的话

所以今天我们换一个思路。  
不是先问“CSS 怎么写”，而是先问“我想要什么样的界面”。

如果样式表达可以变成一种带约束的语言，那 AI 就能更稳定地介入。  
Tailwind 恰好就是这种语言。

### 停留时间

1 分钟

### 操作

无

---

## 第 5 页 一句话出卡片

### 要讲的话

现在我直接给 AI 一个需求：

“做一个渐变卡片，大圆角，柔和阴影，标题醒目，副标题弱一点，底部有一个 CTA 按钮。不要写传统 CSS，直接给我 Tailwind 类名。”

关键点在于，我不是让 AI 写一大段 CSS，而是让它写 Tailwind 原子类。  
这样输出通常更稳定、更可控。

### 停留时间

2 分钟

### 操作

切 AI 对话或展示提示词

---

## 第 6 页 从提示词到页面

### 要讲的话

接下来我把 AI 给出的类名直接贴到页面里。  
保存以后，Tailwind 负责生成原子样式，`weapp-tailwindcss` 负责做小程序适配，最后页面直接更新。

这一步只要通了，整条链路就成立了。

### 停留时间

2 分钟

### 操作

切代码到 [index.vue](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/pages/index/index.vue)

---

## 第 7 页 为什么不是 AI 直接写 CSS

### 要讲的话

很多人会问，为什么不让 AI 直接写 CSS。

因为 Tailwind 类名本质上是一种半结构化语言。  
它有稳定词汇表、稳定组合方式，很适合 AI 做组合。  
而传统 CSS 更自由，也更容易发散。

### 停留时间

2 分钟

### 操作

无

---

## 第 8 页 三层模型

### 要讲的话

这条链路我建议大家记成三层：

1. 你负责描述界面意图
2. AI 负责生成 Tailwind 类名
3. `weapp-tailwindcss` 负责翻译成小程序可运行结果

这三层职责分开以后，系统就会稳定很多。

### 停留时间

2 分钟

### 操作

无

---

## 第 9 页 项目全景

### 要讲的话

接下来我们看仓库本身。

这个项目不只是一个兼容插件。  
README 里明确写了支持 `webpack`、`vite`、`rspack`、`rollup`、`rolldown`、`gulp` 这些构建工具基底。

也就是说，它不是绑定在某一个框架上的技巧，而是在做更通用的小程序 Tailwind 方案。

### 停留时间

2 分钟

### 操作

切 [README.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/README.md)

---

## 第 10 页 仓库结构与模板

### 要讲的话

仓库里还有大量 demo、模板和样例工程。  
可以看到 `uni-app`、`taro`、`mpx`、原生小程序、`weapp-vite`，以及 `uni-app x` 相关内容。

这意味着它不是口头上的“理论兼容”，而是仓库里真有这些工程可参考。

### 停留时间

2 分钟

### 操作

切 `demo/` 或 `templates.jsonc`

---

## 第 11 页 主 Demo 选型

### 要讲的话

今天主 Demo 我选的是 `demo/uni-app-tailwindcss-v4`。

原因很简单：

- 它足够直观
- 足够贴近日常业务
- 配置路径清晰
- 很适合在直播里快速证明链路

### 停留时间

1 分钟

### 操作

无

---

## 第 12 页 核心配置 1：patch

### 要讲的话

先看 `package.json`。

这里有一行必须记住：`postinstall: "weapp-tw patch"`。  
很多样式不生效、任意值异常、JS 字符串 class 不工作，根因就是这条 patch 链路没接好。

### 停留时间

2 分钟

### 操作

切 [package.json](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/package.json)

---

## 第 13 页 核心配置 2：vite 插件

### 要讲的话

再看 `vite.config.ts`。

这里注册了 `uni()` 和 `UnifiedViteWeappTailwindcssPlugin`。  
这说明 Tailwind 样式生成以后，还要经过 `weapp-tailwindcss` 的处理，最后才真正适合小程序。

### 停留时间

2 分钟

### 操作

切 [vite.config.ts](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/vite.config.ts)

---

## 第 14 页 核心配置 3：样式入口

### 要讲的话

再看 `src/main.css`。

这里承载的是 Tailwind 的入口和主题变量，而不是传统业务样式。  
所以从心智上也要切换，我们不是在写一份“大而全”的样式文件，而是在搭建一套原子类表达系统。

### 停留时间

2 分钟

### 操作

切 [main.css](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/main.css)

---

## 第 15 页 Skill Workflow

### 要讲的话

接下来讲一个很重要的部分，就是 Skill。

这个仓库把 AI 的工作流写成了 Skill。  
也就是说，AI 不是自由发挥，而是先收集最小上下文，再给工程化输出。

### 停留时间

2 分钟

### 操作

切 [SKILL.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/skills/weapp-tailwindcss/SKILL.md)

---

## 第 16 页 Skill 要先问什么

### 要讲的话

最小上下文一般包括：

- 框架
- 构建器
- 目标端
- Tailwind 版本
- 包管理器

为什么这很重要？  
因为 AI 最怕上下文不完整。  
Skill 的价值，就是先把问题问对，再去生成结果。

### 停留时间

2 分钟

### 操作

无

---

## 第 17 页 Skill 输出什么

### 要讲的话

Skill 输出的也不是只有代码。  
它会要求包含：

- 修改文件清单
- 可复制配置
- 安装命令
- 验证步骤
- 回滚方案

这才是团队里能用的 AI，不只是“会续写代码”，而是“按工作流办事”。

### 停留时间

2 分钟

### 操作

切 [skill.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/website/docs/ai/basics/skill.md)

---

## 第 18 页 进阶技巧

### 要讲的话

这里补四个实战里最容易踩坑的点：

1. 任意值和 `rpx`
2. 动态 class 不要半截拼接
3. `space-y` / `space-x` 在小程序里的标签限制
4. `twMerge`、`cva`、`cn` 这类运行时合并能力

### 停留时间

3 分钟

### 操作

切 [tailwind-writing-best-practices.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/skills/weapp-tailwindcss/references/tailwind-writing-best-practices.md)

---

## 第 19 页 工程信号

### 要讲的话

最后我想用两个仓库里的工程信号做收尾。

一个是 HMR 报告。  
说明作者关心“改完以后多久看到结果”。

一个是统一口径 benchmark。  
说明这个生态已经开始用数据讨论开发体验，而不是只谈概念。

### 停留时间

2 分钟

### 操作

切 [hot-update-report.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/benchmark/e2e-watch-hmr/hot-update-report.md)  
切 [report.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/benchmark/framework-compare/report.md)

---

## 第 20 页 收尾

### 要讲的话

最后收个尾。

如果今天你只带走一句话，我希望是这句：

不要再把小程序样式开发理解成手写 CSS 的体力活。  
把它变成一句可描述的意图，让 AI 用 Tailwind 说出来，再让 `weapp-tailwindcss` 帮你翻译到小程序和多端。

如果你回去想自己试，就做三步：

1. 跑一个仓库里的 demo
2. 装 `weapp-tailwindcss` Skill
3. 用一句真实需求试一次 AI 出样式

如果你觉得这条路值钱，记得给项目点个 Star。

### 停留时间

2 分钟

### 操作

结束页

---

## 讲者备注

### 如果你只讲 40 分钟

建议删除：

- 第 10 页
- 第 19 页

并把第 15 到 17 页合并成 1 页讲。

### 如果你要讲 60 分钟

建议在第 12 到 18 页之间增加现场代码演示时间。

### 如果你要讲 70 分钟

建议加入：

- 更多观众互动
- 一次真实提示词改写
- 一次“AI 输出一般时如何人工收敛”的讲解

