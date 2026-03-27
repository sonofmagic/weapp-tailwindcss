# Demo Runbook

## 目标

把直播现场的操作压缩到最稳、最短、最容易成功的路径。

## 主 Demo 选择

- 主 Demo：`demo/uni-app-tailwindcss-v4`
- 辅助资料：`skills/weapp-tailwindcss/SKILL.md`
- 数据补充：`benchmark/e2e-watch-hmr/hot-update-report.md`
- 数据补充：`benchmark/framework-compare/report.md`

## 直播前准备

### 环境

- Node 版本确保满足 `>=20.19.0`
- 包管理器统一使用 `pnpm`
- 微信开发者工具提前登录
- 直播前至少提前 30 分钟启动一次主 Demo，确认编译链路正常

### 建议提前打开的窗口

1. 仓库根目录终端
2. `demo/uni-app-tailwindcss-v4` 目录终端
3. 编辑器，提前打开：
   - `demo/uni-app-tailwindcss-v4/package.json`
   - `demo/uni-app-tailwindcss-v4/vite.config.ts`
   - `demo/uni-app-tailwindcss-v4/src/main.css`
   - `demo/uni-app-tailwindcss-v4/src/pages/index/index.vue`
4. 微信开发者工具或真机预览界面

## Round 1 演示步骤

### Step 1：展示关键配置

建议讲解顺序：

1. `package.json`
   - 指出 `postinstall: "weapp-tw patch"`
2. `vite.config.ts`
   - 指出 `uni()` 后挂 `UnifiedViteWeappTailwindcssPlugin`
3. `src/main.css`
   - 指出 Tailwind 入口与主题变量

### Step 2：启动 Demo

建议命令：

```bash
pnpm --dir demo/uni-app-tailwindcss-v4 dev:mp-weixin
```

如果你更习惯在 demo 目录执行：

```bash
cd demo/uni-app-tailwindcss-v4
pnpm dev:mp-weixin
```

### Step 3：给 AI 的提示词

推荐提示词 1：

```text
请帮我生成一组适合小程序页面的 Tailwind 类名，不要写 CSS。
目标是一个渐变会员卡片：
- 大圆角
- 蓝青色渐变背景
- 柔和阴影
- 标题 32rpx，加粗
- 副标题 24rpx，透明度略低
- 右上角一个半透明高光圆
- 底部一个白底深色字按钮
请直接输出适合模板里的 class 字符串，并尽量使用 weapp 友好的写法。
```

推荐提示词 2：

```text
请生成一个小程序首页信息卡的 Tailwind 类名方案，要求：
- 不写传统 CSS
- 尽量使用静态类
- 尽量避免需要运行时拼接的写法
- 尺寸优先使用 rpx 任意值
- 输出结构按：容器、标题、副标题、按钮 四段给我
```

### Step 4：把 AI 输出贴进页面

建议改 `demo/uni-app-tailwindcss-v4/src/pages/index/index.vue`。

示例讲法：

- 原来这里是一个普通 `view`
- 我现在把 AI 给出的类名直接贴到容器、标题、按钮上
- 不单独写 `scss`
- 保存后看编译结果

### Step 5：解释现场发生了什么

现场建议只讲 3 句：

1. AI 负责生成 Tailwind 原子类
2. Tailwind 负责出原子样式
3. `weapp-tailwindcss` 负责把它们转成小程序能跑的样子

## Round 2 演示步骤

### Step 1：切到 Skill

打开：

- `skills/weapp-tailwindcss/SKILL.md`
- `website/docs/ai/basics/skill.md`

### Step 2：讲 Skill 的信息收集最小集

直接口播这 5 个输入：

- 框架
- 构建器
- 目标端
- Tailwind 版本
- 包管理器

### Step 3：展示安装命令

如果是对外直播，建议展示仓库文档中的推荐命令：

```bash
npx skills add sonofmagic/skills --skill weapp-tailwindcss
```

如果想展示本地仓库开发态安装，可以补一句：

```bash
npx skills add . --skill weapp-tailwindcss
```

### Step 4：展示一个完整 AI 提示词

```text
我现在是 uni-app cli vue3 vite 项目，目标端是微信小程序 + H5。
请按 weapp-tailwindcss skill 给我最小可用配置。
输出需要包含：
1. 安装命令
2. 完整配置文件
3. 页面示例
4. 验证步骤
5. 回滚方案
```

### Step 5：强调“AI 不是自由发挥”

现场只要说清楚：

- 有 Skill 以后，AI 不是只给你一段代码
- 它会给你配置、验证、回滚和排障顺序
- 这才是团队里能推广的 AI 用法

## 进阶技巧展示清单

### 任意值与 `rpx`

可以举例：

```html
<view class="text-[length:22rpx]"></view>
<view class="text-[color:#bada55]"></view>
```

### 动态 class 的正确方式

推荐现场展示这种写法：

```ts
const toneMap = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-slate-700',
} as const
```

然后强调不要这么写：

```ts
const className = `bg-${tone}-500`
```

### `space-y` / `space-x`

建议口播顺序：

1. 先改结构
2. 再看 `virtualHost`
3. 最后才扩配置

## 收尾时引用的数据

### HMR 报告

文件：`benchmark/e2e-watch-hmr/hot-update-report.md`

推荐说法：

- “仓库里 2026-02-13 的热更新报告，已经把多个 demo 的 template、script、style 热更新时间列出来了。”
- “这说明作者关注的不只是构建成功，而是日常开发的反馈速度。”

### 框架对比报告

文件：`benchmark/framework-compare/report.md`

推荐说法：

- “2026-02-23 这份统一口径 benchmark 里，`weapp-vite wevu` 这一组的 Build 中位数是 `961.55ms`，HMR 中位数是 `922.91ms`。”
- “我不是要说大家今天必须换框架，而是说明这个生态已经开始用数据讨论体验问题。”

## 现场风险与兜底

### 风险 1：AI 现场卡壳

兜底方案：

- 提前准备一份本地文本，存 2 组提示词和 2 组 AI 输出
- 直播时可以说“我这里直接贴一份刚才已经验证过的输出”

### 风险 2：开发者工具刷新慢

兜底方案：

- 主讲时聚焦“保存后结果变化”
- 如果真机卡顿，就直接展示开发者工具结果

### 风险 3：命令执行时间过长

兜底方案：

- 开场前提前把主 Demo 编译起来
- 直播中只演“改页面”和“看结果”

### 风险 4：观众问“这是不是只适合 Demo”

回答模板：

- “如果它只是 Demo 工程，我不会拿出来讲。这个仓库里同时有模板、Skill、E2E、watch/HMR 报告、benchmark，这些东西一起出现，说明它已经在解决工程问题。”

