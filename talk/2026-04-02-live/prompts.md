# 直播提示词清单

## 使用说明

这份文档把直播里建议使用的提示词单独整理出来，方便你现场直接复制。

建议分三类使用：

1. 现场演示 AI 出样式
2. 演示 Skill 工作流
3. 演示排障与进阶问题

---

## 一、开场 Demo 提示词

### Prompt 1：渐变卡片

```text
请帮我生成一组适合小程序页面的 Tailwind 类名，不要写 CSS。
目标是一个渐变卡片：
- 大圆角
- 蓝青色渐变背景
- 柔和阴影
- 标题 32rpx，加粗
- 副标题 24rpx，透明度略低
- 右上角一个半透明高光圆
- 底部一个白底深色字按钮
请直接输出适合模板里的 class 字符串，并尽量使用 weapp 友好的写法。
```

### Prompt 2：信息卡片

```text
请生成一个小程序首页信息卡的 Tailwind 类名方案，要求：
- 不写传统 CSS
- 尽量使用静态类
- 尽量避免需要运行时拼接的写法
- 尺寸优先使用 rpx 任意值
- 输出结构按：容器、标题、副标题、按钮 四段给我
```

### Prompt 3：更偏业务的卡片

```text
请帮我为一个小程序营销卡片生成 Tailwind 类名。
要求：
- 适合活动页
- 顶部是活动标题和时间
- 中间是优惠信息
- 底部按钮醒目
- 风格简洁，不要太花
- 不写 CSS，只输出 class
- 尽量使用适合 weapp 的写法
```

---

## 二、让 AI 输出更稳的提示词

### Prompt 4：强调静态类优先

```text
请为小程序页面生成 Tailwind 类名，要求：
- 优先使用静态类
- 避免运行时自由拼接 class 字符串
- 尽量使用完整字面量
- 如果需要动态切换，请按枚举方式输出
- 不写传统 CSS
```

### Prompt 5：强调 Tailwind 风格统一

```text
请你扮演一个熟悉 weapp-tailwindcss 的前端工程师。
现在我要做一个小程序页面，请直接给我 Tailwind 类名方案。
要求：
- 风格统一
- 命名和结构适合直接复制到模板里
- 尽量避免复杂自定义 CSS
- 优先考虑小程序兼容性
```

### Prompt 6：要求 AI 输出可复制结构

```text
请按下面结构输出：
1. 容器 class
2. 标题 class
3. 副标题 class
4. 按钮 class
不要输出解释，不要输出 CSS，只输出可直接复制的 Tailwind 类名。
```

---

## 三、Skill 工作流提示词

### Prompt 7：uni-app 最小可用配置

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

### Prompt 8：taro 迁移方案

```text
这是一个 taro webpack5 老项目，已经有 tailwindcss，但样式经常丢失。
请按 weapp-tailwindcss skill 给迁移方案，并列出最小改动清单。
输出需要包含：
1. 修改文件清单
2. 完整配置
3. 验证步骤
4. 回滚方案
```

### Prompt 9：uni-app x 方向

```text
我现在要做一个 uni-app x 项目，目标端包括 Web、小程序、Android、iOS、鸿蒙。
请按 weapp-tailwindcss skill 给我最小可用方案。
请重点说明：
- 需要的配置
- Tailwind 入口
- weapp-tailwindcss 的作用
- 验证步骤
- 回滚方案
```

---

## 四、排障提示词

### Prompt 10：任意值不生效

```text
我在小程序项目里用了 Tailwind 任意值类，比如 text-[22rpx]，但是有些样式不生效。
请按 weapp-tailwindcss skill 给排查顺序，并明确告诉我：
1. 要检查哪些配置
2. patch 是否有关
3. 哪些场景要写成 length:22rpx
4. 最小验证步骤
```

### Prompt 11：JS 字符串 class 不生效

```text
我在 JS/TS 字符串里写 Tailwind class，小程序端不生效。
请按 weapp-tailwindcss skill 给我排查步骤。
输出需要包含：
1. content 或 @source 的检查项
2. patch 相关检查
3. 动态 class 的推荐写法
4. 一个最小正确示例
```

### Prompt 12：space-y / space-x 问题

```text
我的容器写了 space-y-2，但子节点是 button 和自定义组件，间距没有生效。
请按 weapp-tailwindcss skill 给固定优先级排查方案，并给出最小改动建议。
要求明确说明：
1. 先改结构
2. 再评估 virtualHost
3. 最后才扩 cssChildCombinatorReplaceValue
```

---

## 五、动态 class 与规范提示词

### Prompt 13：把动态 class 改成枚举

```text
下面这段代码里有动态拼接 Tailwind class 的问题，请帮我改成更适合 weapp-tailwindcss 的写法。
要求：
- 不要拼半截 token
- 改成完整字面量枚举
- 如果需要，请使用 cn/twMerge/cva 风格
- 给出修改后的代码和原因说明
```

### Prompt 14：生成团队规范

```text
请按 weapp-tailwindcss 的最佳实践，为我们团队生成一份 Tailwind 写法规范。
输出需要包含：
1. 推荐写法
2. 禁止写法
3. 动态 class 规则
4. 任意值和 rpx 规则
5. 最小 Code Review Checklist
```

### Prompt 15：生成组件默认类 + 外部覆盖方案

```text
请帮我设计一个适合小程序组件库的 Tailwind class 合并方案。
要求：
- 组件有默认类
- 支持外部 class 覆盖
- 处理冲突去重
- 适合 weapp-tailwindcss
- 如果需要，可以使用 twMerge/cva/cn
请输出代码结构和推荐说明。
```

---

## 六、直播现场救场提示词

### Prompt 16：AI 输出太散时重试

```text
请重写刚才的 Tailwind 类名方案。
要求：
- 更简洁
- 更适合小程序
- 优先静态类
- 减少冗余
- 不写解释，只输出可复制结果
```

### Prompt 17：让 AI 只输出类名

```text
不要解释，不要写 CSS，不要写 HTML。
只按下面结构输出可直接复制的 Tailwind class：
1. 容器
2. 标题
3. 副标题
4. 按钮
```

### Prompt 18：让 AI 降低设计感

```text
请把刚才那套 Tailwind 类名改得更克制一些。
要求：
- 少一点装饰
- 更接近真实业务页面
- 保留层次感
- 适合小程序首页卡片
```

---

## 七、建议直播时优先使用的 5 条

如果你直播时不想挑太多，优先准备这 5 条就够了：

1. Prompt 1：渐变卡片
2. Prompt 7：uni-app 最小可用配置
3. Prompt 10：任意值不生效
4. Prompt 12：space-y / space-x 问题
5. Prompt 13：把动态 class 改成枚举

