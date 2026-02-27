# weapp-tailwindcss 排障清单（症状优先）

本文件用于“已有项目问题排查”场景。输出时先确认症状，再给最短路径，不要把所有可能性一次性堆给用户。

## 1. JS 字符串里的任意值类名失效或被切断

常见表现：

- `px-[4px]` 在运行后变成 `px- 4px`
- `JS/TS` 中 class 没被转义

排查顺序：

1. 检查文件是否被 Tailwind 扫描
2. v3 看 `content`，v4 看 `@source`
3. 确认文件扩展名包含在扫描规则里
4. 重新执行 `weapp-tw patch`

原因提示：

- `JS` 转译依赖 `tailwindcss-patch` 提供的 `classNameSet`，未被扫描到的类名不会命中转译

## 2. `text-[32rpx]` 被当成颜色

常见表现：

- 生成 `color: 32rpx` 而不是 `font-size`

排查顺序：

1. 确认 `postinstall` 里存在 `weapp-tw patch`
2. 重新执行 `weapp-tw patch`（必要时加 `--clear-cache`）
3. 二义性场景改用显式前缀：`length:` / `color:`

示例：

```html
<view class="text-[length:22rpx]"></view>
<view class="text-[color:#bada55]"></view>
```

## 3. `space-y-*` / `space-x-*` 不生效

常见表现：

- 容器写了 `space-y-2`，子节点是 `button/input/自定义组件` 时无间距

固定优先级（不要跳步）：

1. 优先改结构：子节点落在 `view/text`，或外层补一层 `view`
2. 评估组件层：自定义组件场景启用 `virtualHost`
3. 最后再扩展 `cssChildCombinatorReplaceValue`（最小增量）

示例：

```ts
uvtw({
  cssChildCombinatorReplaceValue: ['view', 'text', 'button'],
})
```

## 4. 开发正常，生产压缩后失效

常见表现：

- `weappTwIgnore`、`twMerge`、`cva`、`tv` 相关行为在生产失效

排查顺序：

1. 检查压缩器是否重命名了函数标识符
2. 确认 `ignoreCallExpressionIdentifiers` 覆盖了封装名
3. 必要时开启压缩保名（keep names）

## 5. `pnpm@10+` 下补丁看似没执行

常见表现：

- 安装依赖后没有 patch 效果

排查顺序：

1. 执行 `pnpm approve-builds weapp-tailwindcss`
2. 确认 `package.json` 有 `postinstall: "weapp-tw patch"`
3. 重新安装依赖或手动执行 `npx weapp-tw patch`

## 6. 多端项目里 H5 被误处理

常见表现：

- H5 样式异常、构建性能下降

排查顺序：

1. 检查 `disabled` 条件是否按平台分支
2. 确认小程序插件能力没有无条件应用到纯 H5
3. 重新验证小程序端与 H5 端的差异配置

## 7. 推荐输出模板

每次排障建议按下列结构回答：

1. 问题归类（定位到上面的症状编号）
2. 立即可做的 1 到 3 步
3. 可复制配置或命令
4. 验证标准（看到什么才算修好）
5. 若未修复时的下一步
