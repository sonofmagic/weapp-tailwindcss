# 直播当天流程单

## 使用说明

这份文档按时间顺序拆成：

1. 开播前一天
2. 开播前 2 小时
3. 开播前 30 分钟
4. 直播中
5. 直播结束后

目标是让你不用临场想事情。

---

## 一、开播前一天

### 内容确认

- 决定本次直播到底讲 70 分钟完整版，还是 40 到 45 分钟精简版
- 决定主讲文档：
  - 长版用 `talk/2026-04-02-live/full-read-script.md`
  - 短版用 `talk/2026-04-02-live/short-read-script.md`
- 决定是否要用 PPT
- 如果用 PPT，先按 `talk/2026-04-02-live/ppt-copy.md` 或 `talk/2026-04-02-live/gamma-copy.md` 做完幻灯片

### Demo 确认

- 主 Demo 固定为 `demo/uni-app-tailwindcss-v4`
- 确认要展示的文件：
  - `package.json`
  - `vite.config.ts`
  - `src/main.css`
  - `src/pages/index/index.vue`
- 提前准备 2 组 AI 输出结果，避免现场生成不稳定

### 提示词确认

- 从 `talk/2026-04-02-live/prompts.md` 里选出本场要用的 5 条
- 单独复制到一个记事本里，避免直播时翻文件

### 风险准备

- 确认直播用网络稳定
- 确认摄像头、麦克风、耳机可用
- 准备一页“如果现场演示卡住，我切回结果页”的备用页

---

## 二、开播前 2 小时

### 设备检查

- 重启电脑或至少关闭无关程序
- 检查剩余电量或接好电源
- 检查麦克风音量
- 检查直播软件场景切换是否正常

### 环境检查

- Node 版本确认满足 `>=20.19.0`
- `pnpm` 可正常用
- 微信开发者工具已登录
- 编辑器字体和缩放适合直播展示

### 仓库检查

- 打开仓库根目录
- 确认 `demo/uni-app-tailwindcss-v4` 依赖完整
- 确认主 Demo 能正常启动

建议至少手动跑一遍：

```bash
pnpm --dir demo/uni-app-tailwindcss-v4 dev:mp-weixin
```

### 页面检查

- 微信开发者工具里确认目标页面能正常打开
- 确认页面改动后能看到更新
- 如果真机要展示，提前配对好

---

## 三、开播前 30 分钟

### 必开窗口

建议提前打开并排好顺序：

1. PPT
2. 编辑器
3. 直播逐字稿
4. AI 对话窗口或提示词文档
5. 微信开发者工具
6. 终端

### 编辑器预开文件

- [package.json](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/package.json)
- [vite.config.ts](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/vite.config.ts)
- [main.css](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/main.css)
- [index.vue](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/demo/uni-app-tailwindcss-v4/src/pages/index/index.vue)
- [SKILL.md](/Users/icebreaker/Documents/GitHub/weapp-tailwindcss/skills/weapp-tailwindcss/SKILL.md)

### 文档预开

- 长版或短版逐字稿
- `talk/2026-04-02-live/demo-runbook.md`
- `talk/2026-04-02-live/prompts.md`

### 直播前自测

- 录 10 秒自己的声音，回放确认是否清晰
- 试一次场景切换：PPT -> 编辑器 -> 开发者工具 -> PPT
- 试一次字体大小，确认直播画面里代码看得清
- 试一次粘贴 AI 输出到页面并保存

### 心态提醒

- 今天不是考试，目标不是“零失误”
- 目标是让观众看懂新范式，并相信这条链路可以复现
- 如果 AI 输出一般，直接用备用结果
- 如果开发者工具卡顿，直接切回代码和结果截图

---

## 四、直播中

### 开场阶段

- 先讲痛点，不要一上来就堆工具名
- 先让观众认同“样式开发很耗时间”
- 3 分钟内必须打出主题和新范式

### Demo 阶段

- 主 Demo 只讲一条最顺的路径
- 不临场乱改别的目录
- 不现场探索陌生文件
- 改动只放在 `index.vue` 里最稳

### Skill 阶段

- 把重点放在 workflow，不放在“AI 很聪明”
- 强调：
  - 先收集上下文
  - 再给配置
  - 再给验证
  - 再给回滚

### 节奏控制

- 每 5 到 8 分钟给一次小结
- 每讲完一个模块抛一个互动问题
- 如果弹幕冷，就用预设互动句

### 互动句备用

- 你们团队现在用 Tailwind 的多吗？
- 你更想把 AI 用在写页面还是排查配置？
- 这个链路你觉得最打动你的点是哪里？
- 如果回去就试，你会先从哪个页面开始？

### 如果现场卡壳

- AI 输出一般：
  - “这版不够克制，我直接换一版刚才准备好的结果。”
- 开发者工具刷新慢：
  - “这里我不等它刷，我先把原理讲完，后面再回来看结果。”
- 终端报错：
  - “这个错误不影响今天主线，我直接切回已启动好的 Demo 看结果。”

---

## 五、直播结束后

### 立即要做的事

- 保存直播现场改过的文件
- 记录这场直播里最顺和最卡的 3 个点
- 记录观众最关心的 5 个问题

### 内容复盘

- 哪一段观众最有反应
- 哪一段信息量太大
- 哪个 Demo 操作步骤可以再缩短
- 哪个提示词效果最好

### 后续素材

- 从直播内容里切出 3 个短视频方向：
  - 一句话出页面
  - 为什么 AI 更适合写 Tailwind 类名
  - `weapp-tailwindcss` Skill 工作流

### 下一场直播备选主题

- `uni-app x` 多端故事
- Skill 驱动团队工作流
- 小程序组件库 Tailwind 写法
- 动态 class 与运行时合并最佳实践

---

## 六、你真正需要记住的 10 件事

1. 先讲痛点，再讲工具
2. 先看结果，再讲原理
3. 主 Demo 固定，不临场冒险
4. AI 输出不好就换备用结果
5. patch 一定要讲
6. Skill 讲 workflow，不讲玄学
7. 进阶技巧只讲最常踩的
8. benchmark 只做工程信号，不做吵架素材
9. 结尾一定给观众一个“回去怎么试”的动作
10. 整场直播的目标不是证明你很强，而是让观众相信这条链路值得试
