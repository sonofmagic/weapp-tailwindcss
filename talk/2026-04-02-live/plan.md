# 直播策划与项目分析

## 直播主题

小程序还能这么写？AI 出样式，Tailwind 跑全端

## 一句话定位

这不是一场“教你再装一个插件”的直播，而是一场把 `AI -> Tailwind 类名 -> weapp-tailwindcss 转译 -> 小程序真机预览` 串成完整工作流的实战演示。

## 目标受众

- 已经在写小程序，但样式开发仍以手写 `scss/wxss` 为主的前端
- 用 `uni-app`、`taro`、原生小程序、`weapp-vite` 的业务开发者
- 对 AI 编程感兴趣，但还没把它稳定接入小程序样式链路的人
- 想做多端，但担心“小程序这一端最难搞”的团队

## 本项目可支撑的核心事实

以下内容都可以直接在仓库中找到依据，适合作为直播里的“证据链”：

1. `weapp-tailwindcss` 不是单一框架插件，而是小程序 `tailwindcss` 全方面解决方案。
   - 依据：`README.md`

2. 当前主线支持的构建工具基底已经覆盖 `webpack`、`vite`、`rspack`、`rollup`、`rolldown`、`gulp`，并支持 Node API 集成。
   - 依据：`README.md`

3. 仓库内已有大量可运行 demo，覆盖 `uni-app`、`uni-app x`、`taro`、`mpx`、原生、`weapp-vite` 等方向。
   - 依据：`demo/*`、`apps/*`、`templates.jsonc`

4. 项目已经把 AI 使用场景正式产品化为 Skill，而不是一句“建议你让 AI 帮你写”。
   - 依据：`skills/weapp-tailwindcss/SKILL.md`
   - 依据：`website/docs/ai/basics/skill.md`

5. 项目对 watch/HMR 体验有专门回归链路，说明作者在关注日常开发效率，而不只是打包成功。
   - 依据：`README.md`
   - 依据：`benchmark/e2e-watch-hmr/hot-update-report.md`

6. 项目对不同框架的 Build、HMR、Runtime 做了统一口径 benchmark，可以支撑“为什么要讲全端与更现代链路”。
   - 依据：`benchmark/framework-compare/README.md`
   - 依据：`benchmark/framework-compare/report.md`

7. `uni-app x` 已被明确作为重要能力点，且 README 直接给出同时构建 `Web`、小程序、`Android`、`iOS`、鸿蒙 5 个运行端的表述。
   - 依据：`README.md`

## 适合直播的主叙事

### 主线

“过去我们把小程序样式开发当作体力活，现在可以把它变成表达问题。”

### 叙事顺序

1. 先刺痛点。
   - 还在手写 `margin-left: 20rpx`
   - 还在改一次样式就来回切设计稿、IDE、开发者工具

2. 再给一个极强的即时反馈。
   - 对 AI 说一句话
   - 让它直接产出 Tailwind 类名
   - 马上在小程序里看到结果

3. 再解释为什么这件事在小程序场景成立。
   - Tailwind 的原子类是可枚举、可组合、可迁移的“半结构化语言”
   - AI 最擅长的就是这种带约束的语言生成
   - `weapp-tailwindcss` 负责把 Web 语义翻译成小程序能跑的产物

4. 然后把“炫技”升格成“工程能力”。
   - 支持的框架多
   - 有 Skill
   - 有 demo
   - 有 e2e
   - 有 benchmark
   - 有多端路径

## 建议直播结构

- 开场与痛点：5 分钟
- 为什么 AI + Tailwind 是天作之合：8 分钟
- 项目全景与能力矩阵：8 分钟
- 实操 Round 1，`uni-app + Tailwind CSS v4`：12 分钟
- 实操 Round 2，AI Skill 驱动全流程：15 分钟
- 进阶技巧与常见坑：8 分钟
- 性能、全端与收尾：4 到 6 分钟

合计建议时长：60 分钟左右。

## 直播里的事实说法建议

### 可以直接说

- “这个项目仓库里已经把 AI Skill、demo、e2e 和 benchmark 都放在一起了，不是 PPT 工程。”
- “README 明确写了支持 `webpack` / `vite` / `rspack` / `rollup` / `rolldown` / `gulp` 这些基底。”
- “到 2026 年 3 月 27 日我准备这场直播时，仓库里已经有 `uni-app x` 多端能力说明，也有专门的 Skill 文档和 benchmark 报告。”

### 建议更稳妥地说

- 把“10+ 框架”表述成“覆盖 `uni-app`、`uni-app x`、`taro`、`mpx`、`rax`、原生、`weapp-vite` 等主流方案，按不同框架变体和模板组合可以到 10+。”
- 把“性能一定更强”表述成“当前仓库在统一口径 benchmark 下，`weapp-vite wevu` 这一组在 2026-02-23 这份报告里 Build 和 HMR 中位数更低。”

## 最佳 Demo 选择

## Round 1

- 目录：`demo/uni-app-tailwindcss-v4`
- 原因：
  - 主题贴合“5 分钟从零到页面”
  - `vite.config.ts`、`main.css`、`tailwind.config.js` 都清晰
  - `postinstall: "weapp-tw patch"` 明确可讲
  - 页面中已经包含 `rpx` 任意值、动态 class、`twMerge`、分包跳转等可展示点

## Round 2

- 内容中心：`skills/weapp-tailwindcss/SKILL.md` + `website/docs/ai/basics/skill.md`
- 原因：
  - 这是“AI 驱动开发全流程”的直接证据
  - 可以讲“AI 不是自由发挥，而是走 workflow”
  - 能自然引出“信息收集最小集”“回滚方案”“验证步骤”

## 进阶技巧必须覆盖的点

- 任意值与 `rpx` 二义性
- `postinstall: "weapp-tw patch"` 为什么不能漏
- Tailwind v3 的 `content` 与 v4 的 `@source/@config` 心智差异
- 动态 class 不要自由拼接半截 token，要枚举
- `twMerge` / `cva` / `cn` 的价值
- `space-y-*` / `space-x-*` 在小程序端的标签限制
- `uni-app x` 的 5 端故事要讲成“未来感”，但不强行现场全演

## 直播风险与备用方案

1. AI 当场输出不稳定
   - 处理：提前准备 2 组已经验证过的提示词与一份备用类名结果

2. 开发工具或真机预览启动慢
   - 处理：提前打开编译产物目录和开发者工具，直播时只展示“改动 -> 刷新 -> 生效”

3. 某个框架 demo watch 临场抖动
   - 处理：主 Demo 固定为 `demo/uni-app-tailwindcss-v4`
   - 补充论据改为展示仓库已有报告：`benchmark/e2e-watch-hmr/hot-update-report.md`

4. 观众纠缠“AI 生成的类名不优雅”
   - 处理：转到“写法规范”议题，展示 `skills/weapp-tailwindcss/references/tailwind-writing-best-practices.md`

## 交付物清单

本次已同步规划以下直播资料：

1. 直播大纲
2. 逐段口播稿
3. Demo Runbook
4. 宣发与标题文案

