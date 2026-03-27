# 40-45 分钟精简口播方案

## 使用说明

这是一份适合 40 到 45 分钟直播的精简台本。

适用场景：

- 时间被压缩
- 你想保留核心观点和主 Demo
- 你不想讲太多仓库细节

建议策略：

- 主讲 `AI + Tailwind + weapp-tailwindcss` 这条链路
- Demo 只保留 `demo/uni-app-tailwindcss-v4`
- Skill 与 benchmark 只做点到为止

---

## 00:00-02:00 开场

### 要说的话

大家晚上好，今天这场直播的主题是“小程序还能这么写？AI 出样式，Tailwind 跑全端”。

我先直接抛结论。  
今天我想证明一件事，小程序样式开发不应该再是那种一行一行手写 `margin-left: 20rpx` 的体力活了。  
我们完全可以把它换成另一种链路：一句话描述界面，AI 生成 Tailwind 类名，`weapp-tailwindcss` 负责转成小程序能跑的结果，最后直接预览。

所以今天不只是讲工具，而是讲一种新的开发范式。

### 屏幕动作

- 标题页

---

## 02:00-05:00 痛点与问题重述

### 要说的话

为什么这件事值得讲？  
因为很多人做小程序，花在样式上的时间太多了。

真正慢的地方通常有三个：

1. 表达成本高
2. 试错成本高
3. 跨端一致性差

你脑子里想的是一个界面，但手上敲出来的是一堆零碎属性。  
如果继续用传统写法，这个过程就会一直很慢。

但如果我们把样式表达换成一种带约束的语言，AI 就能帮上很大的忙。  
Tailwind 恰好就是这种语言。

### 互动句

大家可以在弹幕里打一下，你现在最烦的小程序样式问题是什么。

---

## 05:00-11:00 先看结果

### 要说的话

我先不讲太多原理，我们直接先看结果。

现在我给 AI 一个需求：

“帮我做一个渐变卡片，大圆角，柔和阴影，标题醒目，副标题弱一点，底部有 CTA 按钮。不要写传统 CSS，直接给我 Tailwind 类名。”

为什么我要强调 Tailwind 类名？  
因为让 AI 直接写传统 CSS，通常输出会很散。  
但 Tailwind 类名是可枚举、可组合、可约束的，所以 AI 生成得会更稳。

接下来我把这组类名直接贴到页面里。  
然后大家看页面变化。

这一步只要通了，就说明整条链路是成立的：

1. AI 负责生成原子类
2. Tailwind 负责生成样式
3. `weapp-tailwindcss` 负责适配到小程序

### 屏幕动作

- 打开 AI 提示词
- 打开 [index.vue](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/pages/index/index.vue)
- 粘贴类名
- 展示开发者工具结果

### 救场话术

如果 AI 现场输出一般，也没关系。  
今天最重要的是看这条链路是不是顺。

---

## 11:00-17:00 为什么 AI + Tailwind 很搭

### 要说的话

很多人会问，为什么是 Tailwind，而不是让 AI 直接写 CSS。

原因很简单。  
Tailwind 的类名，其实是一种半结构化语言。  
它有固定词汇，有稳定组合方式，很适合 AI 去生成。

比如：

- `rounded-2xl`
- `shadow-lg`
- `px-4`
- `text-[28rpx]`
- `from-cyan-500`
- `to-blue-600`

AI 很擅长这种“有限语法空间里的组合任务”。  
所以它写 Tailwind 类名，通常会比写自由风格 CSS 稳得多。

换句话说，Tailwind 的价值不只是少写字，而是让样式变成一种可被 AI 理解的语言。

### 屏幕动作

- 放一页“三层模型”
  - 需求意图
  - Tailwind 类名
  - 小程序适配

---

## 17:00-27:00 主 Demo 讲解

### 要说的话

接下来我讲一下这个主 Demo，目录是 `demo/uni-app-tailwindcss-v4`。

我为什么选它？  
因为它足够直观，也足够贴近日常业务项目。

这里我只带大家看三个关键点。

第一个，`package.json`。  
这里有一行特别重要：`postinstall: "weapp-tw patch"`。  
这行不能漏。很多样式不生效、任意值异常、JS 里的 class 不工作，根因就是 patch 没接好。

第二个，`vite.config.ts`。  
这里注册了 `uni()` 和 `UnifiedViteWeappTailwindcssPlugin`。  
这意味着 Tailwind 出来的样式，还要经过 `weapp-tailwindcss` 再处理一次，最后才适合小程序环境。

第三个，`src/main.css`。  
这里承载的是 Tailwind 的入口和主题变量，而不是传统意义上的业务样式文件。

所以你会发现，整条链路并不复杂。  
真正关键的是：

1. patch 接上
2. 插件接上
3. 页面开始直接用类名表达样式

### 屏幕动作

- 打开 [package.json](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/package.json)
- 打开 [vite.config.ts](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/vite.config.ts)
- 打开 [main.css](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/main.css)

### 互动句

如果你们要回去试，我建议先别全量迁移。  
先从卡片、列表、按钮区块这种高频页面开始。

---

## 27:00-34:00 Skill 与 AI 工作流

### 要说的话

接下来我想补一个很重要的点，就是 Skill。

这个仓库里并不是只说“让 AI 帮你写代码”，而是把 AI 的工作流沉淀成了 Skill。

Skill 会先让 AI 收集最小上下文，比如：

- 你是什么框架
- 你用什么构建器
- 目标端是什么
- Tailwind 是 v3 还是 v4
- 包管理器是什么

然后它输出的也不是一段孤零零的代码，而是：

- 修改文件清单
- 可复制配置
- 安装命令
- 验证步骤
- 回滚方案

这件事很重要。  
因为真正能进团队的 AI，不是“看起来很会写”，而是“按流程办事”。

### 屏幕动作

- 打开 [SKILL.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/skills/weapp-tailwindcss/SKILL.md)
- 打开 [skill.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/website/docs/ai/basics/skill.md)

---

## 34:00-40:00 进阶技巧

### 要说的话

最后补几个实战里特别容易踩坑的点。

第一，任意值和 `rpx`。  
像 `text-[22rpx]` 这种写法很好用，但有时要更明确，比如 `text-[length:22rpx]`。

第二，动态 class。  
不要写 `bg-${color}-500` 这种半截拼接。  
尽量用枚举，让 AI 和人都在完整字面量里选。

第三，`space-y` 和 `space-x`。  
在小程序里这类类名不是天然对所有标签都一样生效。  
排查顺序建议是：

1. 先改结构
2. 再看 `virtualHost`
3. 最后才扩配置

第四，运行时合并。  
如果做组件库或外部类名覆盖，`twMerge`、`cva`、`cn` 会很重要。

### 屏幕动作

- 打开 [tailwind-writing-best-practices.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/skills/weapp-tailwindcss/references/tailwind-writing-best-practices.md)

---

## 40:00-45:00 收尾

### 要说的话

最后收个尾。

如果今天你只带走一句话，我希望是这句：

不要再把小程序样式开发理解成手写 CSS 的体力活。  
把它变成一句可描述的意图，让 AI 用 Tailwind 说出来，再让 `weapp-tailwindcss` 帮你翻译到小程序。

如果你回去想自己试，建议就做三步：

1. 跑一个仓库里的 demo
2. 安装 `weapp-tailwindcss` Skill
3. 用一句真实业务需求试一次 AI 出样式

如果你觉得这条路值钱，记得给项目点个 Star。  
后面如果大家愿意，我也可以继续做第二场，专门讲更细的团队规范、Skill 用法和多端工程化。

### 屏幕动作

- 结束页

### 最后互动句

如果要做下一场，你们更想看：

- `uni-app x`
- Skill 实战
- 多端工程规范
- 组件库写法

