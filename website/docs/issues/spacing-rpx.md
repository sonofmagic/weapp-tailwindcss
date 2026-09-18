---
title: 微信小程序 --spacing 与 rpx 计算限制
description: 说明 Tailwind CSS 4 的 --spacing 使用 rpx 时，微信小程序的 calc 尺寸偏差、cssCalc 预计算限制和运行时主题取舍。
keywords:
  - weapp-tailwindcss
  - Tailwind CSS 4
  - 微信小程序
  - spacing
  - rpx
  - calc
  - cssCalc
  - CSS 变量
---

# 微信小程序 --spacing 与 rpx 计算限制

Tailwind CSS 4 允许在 `@theme` 中设置 `--spacing: 1rpx`，但微信小程序中生成了合法 WXSS，不代表最终尺寸一定与直接写 `rpx` 相同。依赖该基数的尺寸、内外边距等工具类可能保留运行时乘法：

```css
@theme {
  --spacing: 1rpx;
}
```

```css title="生成的声明示例"
.w-32 { width: calc(var(--spacing) * 32); }
.p-4 { padding: calc(var(--spacing) * 4); }
```

相关复现、环境和修复进度见 [Issue #1214](https://github.com/sonofmagic/weapp-tailwindcss/issues/1214)。下面分别说明微信运行时的限制和 `weapp-tailwindcss@5.5.6` 已确认的构建问题；其他版本应检查实际产物。

## 微信对 rpx 的换算可能放大基数误差

在无 Tailwind 的原生 WXSS 对照中，`calc(1rpx * 32)` 测得 `32px`，直接 `32rpx` 测得 `16px`。该对照使用微信开发者工具 `2.02.2608070`、基础库 `3.17.3`，模拟器窗口宽度为 `390`、DPR 为 `3`。

用户另反馈 `1rpx`、`3rpx` 等奇数 spacing 基数有偏差，并提供以下结果：

| 表达式 | 用户反馈的尺寸 |
| --- | --- |
| `calc(1rpx * 8)` | `8px` |
| `calc(1 * 8rpx)` | `4px` |

这组用户反馈尚未独立复测，未提供设备参数；`3rpx` 也没有具体测量值。两种表达式在长度运算上都应得到 `8rpx`，反馈与“先对带单位的操作数换算、取整，再做乘法”的表现一致，但微信内部算法尚未确认。不能把表中的 px 数值当作所有设备上的固定换算比例。

这也不意味着偶数基数一定安全：上述原生对照中，`calc(2rpx * 32)` 与直接 `64rpx` 分别测得 `32px` 和 `33px`。不要仅通过把基数改成偶数来规避问题。

`calc(1 * 8rpx)` 改变了携带单位的数值，并非只交换左右顺序；不能据此认为 `calc(8 * 1rpx)` 可以修复。

## cssCalc 的能力与已知限制

`cssOptions.cssCalc` 默认关闭。需要对固定主题值预计算时，可以显式选择变量：

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

这个配置的目标是把已知的 `calc(1rpx * 32)` 归约成 `32rpx`，让微信只换算最终长度。使用时需要注意：

- **预计算需要变量值上下文。** 在 `5.5.6` 的 uni-app 微信构建复现中，顶层和嵌套 `cssCalc: ['--spacing']` 都仍输出 `calc(var(--spacing)*32)`。小程序延后处理链路提前改写主题选择器，同时没有向最终求值阶段传递变量值；求值器本身支持 `rpx`，但仅开启选项不能保证这条链路输出静态值。
- **静态 fallback 可能被覆盖。** `cssCalc: true` 可以保留后面的原始 `var()` / `calc()` 声明。如果微信接受该表达式，后续声明仍会覆盖前面的静态值，即使它的尺寸计算有偏差。数组形式用于在成功预计算后清理匹配的原始声明；无法求值时不能假定原声明已被替换。
- **单位转换不等于乘法预计算。** 开启 `rem2rpx`、`px2rpx`，或确认最终变量已变成 `rpx`，都不能单独证明运行时 `calc` 已消除。

构建后应检查工具类的最终属性值，以及同一属性后面是否还有会覆盖它的表达式。只确认 `--spacing: 1rpx` 和类名存在还不够。

## @theme inline 不会自动消除 calc

单独改为 `@theme inline { --spacing: 1rpx; }`，仍可能输出 `calc(1rpx * 32)`。原生 WXSS 对照已确认这种写法也有偏差。

`@theme inline` 同时开启 `cssCalc: ['--spacing']`，在 `5.5.6` 发布版生成器及延后处理的内存验证中能得到 `32rpx`。该组合尚未完成真实 uni-app 构建及设备验证，不能作为已确认的通用修复；使用前仍需检查产物和目标设备。

## 固定尺寸与运行时主题如何选择

对固定尺寸，当前可以直接写最终 `rpx` 值，例如：

```html
<view style="width: 32rpx; padding: 4rpx"></view>
```

也可以使用 `w-[32rpx]`、`p-[4rpx]` 等任意值，并检查最终 WXSS 是否输出相应的直接长度。目标是先得到完整尺寸，再交给微信换算；不要按某台设备的比例预转 px 或添加经验补偿系数。

如果需要在页面、组件或主题切换时覆盖 `--spacing`，静态化会改变行为：已经生成的 `width: 32rpx` 不会再随 `--spacing` 更新。将固定值通过 `@theme inline` 内联也会失去对该变量的运行时引用。只对构建期固定的变量启用这种策略；动态场景可以改为运行时计算最终尺寸并更新样式，避免继续放大一个很小的 rpx 基数。

## 验证范围

- 同时检查最终 WXSS 和实际尺寸，比较 `calc(1rpx * 8)`、`calc(1 * 8rpx)`、`calc(8 * 1rpx)` 与直接 `8rpx`；补充 `3rpx`、偶数、小数及负值对照。
- 修改主题值后重新验证开发模式和生产构建，确认没有使用旧的预计算值。
- 记录设备窗口宽度、DPR、基础库和渲染后端。现有独立运行时证据覆盖上述 DevTools 环境，尚未验证 Android/iOS 真机或 Skyline；不能直接推广到 H5 或其他小程序平台。

配置说明见 [CSS 变量计算模式](../multi-platform.md#css-变量计算模式)。
