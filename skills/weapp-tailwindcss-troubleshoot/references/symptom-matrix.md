# 症状矩阵

## 通用四层

1. 生成：Tailwind 是否产生候选和 CSS。
2. 转译：CSS selector、模板和 JS 是否同步变成目标端 class。
3. 产物：正确平台、主包/分包文件是否包含结果。
4. 运行：组件隔离、WebView、压缩或平台限制是否阻止生效。

## 完全没有样式

1. 入口是否为纯 CSS并包含 `@import "tailwindcss"`。
2. 入口是否被应用真实导入。
3. `cssEntries` 是否为绝对路径并覆盖所有入口。
4. `@source` 是否覆盖业务源码且未误排除。
5. 是否错误 `disabled`，或存在第二个生成器覆盖结果。

## JS/模板任意值被切断或未转译

1. 检查源文件是否进入 `@source`。
2. JavaScript 字符串必须进入 Tailwind 验证过的 `classNameSet`；未命中时保持原文是安全设计，不是转译器应猜测的候选。
3. 模板中的标准 `class` 之外，如果 class 通过 `root-class`、`custom-class` 等组件属性传递，应为对应标签配置 `customAttributes`。
4. watch 中先刷新 class set，再转换 JS/模板。
5. 不启用 `alwaysEscape` 或普通字符串启发式转译。

```ts
WeappTailwindcss({
  customAttributes: {
    'my-button': ['root-class'],
  },
})
```

原生微信 `externalClasses` 是组件运行时的外部样式类机制，不会自动把自定义属性加入构建期模板转换；两者需要分别配置和验证。

API 路径、路由、资源地址被误改时，检查手工 runtime set 是否混入普通字符串。

## 新 class 首次不生效或 HMR 失效

1. 保持同一 dev 进程，连续新增两个此前不存在的任意值 class。
2. 区分模板/脚本/style 的修改载体和对应模块图事件。
3. 检查 Tailwind 入口、`@source` 或配置变化是否触发 runtime refresh。
4. 检查最终 CSS、DOM/raw class 和 safe class 是否同时更新。
5. 不通过重启进程掩盖 HMR 图丢失。

## rpx 与任意值

- 二义性 `text-[22rpx]` 使用 `text-[length:22rpx]`。
- 颜色使用 `text-[color:#bada55]`。
- `calc()`、主题变量和 App WebView 问题先检查生成 CSS，再检查目标端兼容转换。

## `space-*`、`group`、`peer`

- `space-y-*`/`space-x-*` 先让相邻节点落在 `view`/`text` 或增加 `view` 包装。
- 自定义组件评估 `virtualHost`。
- 最后最小扩展 `cssOptions.cssChildCombinatorReplaceValue`。
- `group`/`peer` 依赖兄弟、后代选择器；先确认目标小程序平台允许对应结构。

## 组件内不生效

- 原生组件检查样式隔离和 `addGlobalClass`。
- 第三方组件检查 external classes/透传位置。
- 分包检查样式是否注入正确 scope，独立分包不能依赖主包全局样式。

## CSS 变量、渐变、阴影缺失

检查 Tailwind 变量初始化区是否被框架插件或 HTML 兼容插件删除。比较生成前、适配后和最终平台 CSS，不直接补一份变量到输出目录。

## 开发正常、生产失败

- 检查压缩器函数重命名是否影响自定义 class helper 标识符。
- 检查 minifier 是否重写 selector、注释条件或 CSS 变量。
- 使用生产构建的真实产物和设备验证，不用开发缓存下结论。

## 多端错位

| 目标 | 证据 |
| --- | --- |
| 小程序 | 实际 `.wxss/.acss/.ttss/...` 与开发者工具页面 |
| H5/Web | 浏览器 DOM raw class、生成 CSS、HMR |
| Android App | 实际输出目录、System WebView/Chromium、logcat/页面 |
| iOS App | 实际输出目录、WKWebView/WebKit、模拟器日志/页面 |
| Harmony | UVUE/UTS/JS/CSS 产物、设备与 HBuilderX/DevEco 版本 |
