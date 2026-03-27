# 主播开播桌面版 One-Pager

## 先开哪几个文件

1. [full-read-script.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/talk/2026-04-02-live/full-read-script.md)
2. [demo-runbook.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/talk/2026-04-02-live/demo-runbook.md)
3. [prompts.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/talk/2026-04-02-live/prompts.md)
4. [checklist.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/talk/2026-04-02-live/checklist.md)

## 开场第一句话

大家晚上好，今天这场直播的主题是“小程序还能这么写？AI 出样式，Tailwind 跑全端”。

## 开场三句

1. 小程序样式开发不该再是一行一行手写 `margin-left: 20rpx` 的体力活。
2. 今天我想讲的不是一个插件，而是一条新链路。
3. 一句话描述界面，AI 生成 Tailwind 类名，`weapp-tailwindcss` 负责小程序适配。

## 整场主线

1. 先讲痛点
2. 再看结果
3. 再讲为什么 AI + Tailwind 天作之合
4. 再讲 `weapp-tailwindcss` 仓库全景
5. 再做主 Demo
6. 再讲 Skill
7. 最后讲进阶技巧和收尾

## 痛点只讲这三点

- 表达成本高
- 试错成本高
- 跨端一致性差

## Demo 只走这一条链路

主 Demo：

- `demo/uni-app-tailwindcss-v4`

主讲文件：

- `package.json`
- `vite.config.ts`
- `src/main.css`
- `src/pages/index/index.vue`

## Demo 时一定要讲的三句话

1. AI 负责生成 Tailwind 原子类
2. Tailwind 负责生成原子样式
3. `weapp-tailwindcss` 负责把它们转成小程序能跑的结果

## 关键配置别忘了讲

- `postinstall: "weapp-tw patch"`
- `UnifiedViteWeappTailwindcssPlugin`
- Tailwind 入口在 `src/main.css`

## Skill 只讲这三点

1. 先收集上下文
2. 再输出配置
3. 再给验证步骤和回滚方案

上下文最小集：

- 框架
- 构建器
- 目标端
- Tailwind 版本
- 包管理器

## 进阶技巧只讲这四点

1. 任意值与 `rpx`
2. 动态 class 要枚举，不要半截拼接
3. `space-y / space-x` 在小程序里的限制
4. `twMerge / cva / cn`

## 提示词优先顺序

1. 渐变卡片
2. uni-app 最小可用配置
3. 任意值不生效排查
4. `space-y / space-x` 问题
5. 动态 class 改枚举

提示词文件：

- [prompts.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/talk/2026-04-02-live/prompts.md)

## 观众互动句

- 你们现在做小程序样式，主要还是手写 CSS，还是已经开始用 Tailwind 了？
- 你更想把 AI 用在写页面还是排查配置？
- 这个链路里最打动你的点是什么？
- 如果回去就试，你会先从哪个页面开始？

## 如果现场卡壳

### AI 输出一般

这版不够克制，我直接换一版刚才准备好的结果。

### 开发者工具刷新慢

这里我不等它刷，我先把原理讲完，后面再回来看结果。

### 终端报错

这个错误不影响今天主线，我直接切回已启动好的 Demo 看结果。

## 结尾一定要讲

不要再把小程序样式开发理解成手写 CSS 的体力活。  
把它变成一句可描述的意图，让 AI 用 Tailwind 说出来，再让 `weapp-tailwindcss` 帮你翻译到小程序和多端。

## 结尾 CTA

1. 先跑一个仓库里的 demo
2. 再装 `weapp-tailwindcss` Skill
3. 最后用一句真实需求试一次 AI 出样式

## 最后 30 秒

如果大家愿意，后面我还可以继续做第二场，专门讲：

- `uni-app x`
- Skill 驱动团队工作流
- 小程序组件库 Tailwind 写法
- 动态 class 与运行时合并最佳实践

