# uni-app Vite HMR 任意颜色类缺失根因说明

日期：2026-07-09

## 问题范围

这份文档记录下面这个回归问题的根因、修复依据和验证证据：

1. 在 uni-app Vite 小程序项目中执行 `pnpm dev:mp-weixin`。
2. 初始生成的 `dist/dev/mp-weixin/app.wxss` 中已经有 Tailwind CSS 产物。
3. 在 watch 模式下，给 Vue 页面模板新增 `text-[yellow] bg-[blue]`。
4. HMR 结束后，`app.wxss` 中没有出现对应的小程序转义选择器：
   - `.text-_byellow_B`
   - `.bg-_bblue_B`

这个问题已经在真实项目和仓库 demo `demo/uni-app-vite-tailwindcss-v4` 中复现。

## 结论

这个问题不是 Tailwind v4 的 `@source` 配置错误，不是类名转义错误，也不是源文件扫描没有扫到 Vue 模板。

核心原因是：Vite serve 阶段的 HMR CSS 生成缓存 key 不一致。同一个 CSS 入口在 Vite 的不同生命周期里可能有不同的 id 形态，例如：

- `/project/src/tailwind.css`
- `/project/src/tailwind.css?direct&t=1000`
- Vite module graph 中的 `id`、`file`、`url`

HMR target 收集逻辑已经对 CSS target id 做了归一化，但生成 CSS 的几个缓存 map 在部分读写路径里仍然使用原始 `file` 字符串。这样一来，两个本来指向同一个 CSS 入口的 Vite id，因为字符串形态不同，在缓存和 target 判断里被当成了不同文件。

最终表现是：HMR 流程已经看到了 Vue 模板中新加的 `text-[yellow]`、`bg-[blue]`，WXML/template 侧 class 也可以被转义；但插件没有稳定命中应该更新的 CSS 生成缓存，导致根样式产物 `app.wxss` 没有及时补上这些新工具类。

## HMR 数据流

期望的数据流是：

1. Vue 源文件发生变更。
2. `source-candidates` 更新运行时候选类集合，并记录新增类，比如 `text-[yellow]` 和 `bg-[blue]`。
3. 插件通知 Vite 更新拥有 Tailwind 根 CSS 的 CSS module。
4. serve CSS HMR 插件针对这个 CSS 入口重新生成 CSS。
5. 生成后的 CSS 被回放到小程序样式产物，例如 `app.wxss`。

这次问题发生在第 3 步到第 4 步之间。

候选类扫描本身已经成功，问题出在插件判断“当前 CSS HMR transform 是否属于一个已有生成 CSS target”时。这个判断依赖下面几个 map/set：

- `cleanGeneratedCssByFile`
- `tracedGeneratedCssByFile`
- `generatedClassSetByFile`
- `pendingHmrCssTargetFiles`

修复前，这些结构没有始终使用同一套归一化 key。有些地方用的是归一化后的 Vite persistent cache key，有些地方还在直接使用原始 `file`。

## 为什么只在 HMR 中出现

初始 dev 构建不太容易暴露这个问题，因为 CSS 入口在完整构建路径里比较稳定，`app.wxss` 会基于当前完整候选类集合生成。

HMR 不一样：

1. Vite 会传入带 query 的 module id，尤其是 CSS direct update 场景。
2. 插件为了性能，会在“只新增非运行时影响类”时尽量避免完整 Tailwind 重新生成。
3. 这个增量路径必须确认“正在热更新的 CSS 文件”和“已经缓存过生成 CSS 的文件”是同一个 CSS target。

如果这两个文件名没有用同一种方式归一化，HMR 快路径就可能判断“没有匹配的 CSS target”，即使它们实际上指向同一个 CSS 入口。

所以这个问题会表现为：重启或全量构建可以生成类，但在 watch 模式中临时新增 `text-[yellow] bg-[blue]` 时，`app.wxss` 可能没有及时更新。

## 修复方式

修复方式是给生成 CSS 缓存和 HMR CSS target 使用同一个规范化 key 函数：

```ts
const normalizeGeneratedCssCacheFile = (file: string) => normalizeVitePersistentCacheKey(cleanUrl(file))
const normalizeHmrCssTargetFile = normalizeGeneratedCssCacheFile
```

然后在 serve CSS 生成路径里统一使用 `fileKey`：

- 判断 clean generated CSS 是否存在；
- 判断 generated class set 是否存在；
- 判断 pending HMR CSS target 是否匹配当前 CSS transform；
- 读取之前带 source trace 的 CSS；
- 写入 clean CSS、traced CSS、generated class set；
- 输出 cache hit 诊断信息。

相关实现位置：

- `packages/weapp-tailwindcss/src/bundlers/vite/shared/create-framework-plugins.ts`
  - `normalizeGeneratedCssCacheFile`
  - `resolvePendingHmrCandidateChange`
  - `generateTailwindCssForVitePipeline`

## 为什么这个修改边界是正确的

这个修复放在插件的 Vite serve CSS 生命周期里，而不是改用户配置，也不是直接写 `dist/dev/mp-weixin/app.wxss`。

依据如下：

1. 用户的 `@source` 配置本身是正确的。真实项目的 CSS 入口里配置了 `@source "../**/*.{html,js,ts,jsx,tsx,vue}"`，HMR 时新增类也已经进入 source candidate 流程。
2. 类名转义链路本身是正确的。预期转义结果仍然由正常的小程序转义逻辑产生：
   - `text-[yellow]` -> `text-_byellow_B`
   - `bg-[blue]` -> `bg-_bblue_B`
3. 破损的是插件内部契约：所有描述同一个 Vite CSS module 的生成 CSS 缓存 map，必须使用同一个 canonical key。
4. 直接 patch 输出目录会绕过 Vite/Tailwind 的生命周期，只能隐藏问题，不能修复根因。
5. 每次模板 HMR 都强制全量重新生成也能掩盖问题，但会破坏现有增量 HMR 设计并增加 watch 成本。统一 key 可以保留原本的增量路径。

## 回归覆盖

这次修复覆盖了三个层级。

### 单元测试

`packages/weapp-tailwindcss/test/bundlers/vite-plugin-hooks.unit.test.ts`

单测模拟了完整的关键链路：

1. 对 `/project/src/tailwind.css` 做初始 serve CSS 生成；
2. Vue 模板 HMR 新增 `text-[yellow] bg-[blue]`；
3. Vite 用 `/project/src/tailwind.css?direct&t=1000` 触发 CSS direct update。

断言点包括：

- 没有发送 full reload；
- Vite 收到了 `/src/tailwind.css` 的 CSS update；
- 重新生成的 CSS 包含 `.text-[yellow]` 和 `.bg-[blue]`；
- 传给生成器的 runtime candidate set 包含 `text-[yellow]` 和 `bg-[blue]`。

这直接证明：原始 CSS id 和带 query 的 CSS HMR id 会被识别为同一个 CSS target。

### 集成测试

`packages/weapp-tailwindcss/test/integration/tailwindcss-v4-hmr.test.ts`

集成测试复制 `uni-app-vite-tailwindcss-v4` demo，修改 `src/pages/index/index.vue`，然后验证 Tailwind v4 runtime class set 在变更后包含 `text-[yellow] bg-[blue]`。

### Watch HMR e2e / demo

`tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended.ts`

原有的 user-reported HMR case 保留不动：

- `text-[102.43rpx]` -> `text-[103.43rpx]`

新增的是一个独立 template round，而不是替换旧 case：

- round：`named-arbitrary-colors`
- tokens：`text-[yellow]`、`bg-[blue]`，另加一个带 seed 的高度类，只用于满足 runner 对 fresh class 数量的要求

小程序 watch 回归验证命令：

```bash
pnpm --filter @weapp-tailwindcss/scripts test:watch-hmr -- --case uni-app-vite-tailwindcss-v4 --skip-build --mini-program-only
```

验证日志包含：

- `round=named-arbitrary-colors ... text-[yellow] | bg-[blue]`
- `user-reported=index text-[102.43rpx] to text-[103.43rpx]`
- 最终结果：`all cases passed`

## 真实项目验证

修复后的本地包被 link 到真实项目：

```text
/Users/icebreaker/Downloads/uni-app-base 2
```

真实项目启动命令：

```bash
pnpm dev:mp-weixin
```

临时在页面中加入：

```html
<div class="text-[yellow] bg-[blue]">
  HMR probe
</div>
```

HMR 后，`app.wxss` 中出现：

```css
.bg-_bblue_B {
    background-color: blue;
}

.text-_byellow_B {
    color: yellow;
}
```

生成后的 WXML 中也出现：

```html
text-_byellow_B bg-_bblue_B
```

验证结束后，临时 probe 已删除。

## 后续维护规则

以后任何改动只要涉及 Vite serve CSS 生成，都必须保持下面这个不变量：

> 所有用来标识 generated CSS source file 的 cache map 或 target set，都必须使用同一个归一化后的 Vite persistent cache key，并且先通过 `cleanUrl` 去掉 query/hash。

如果后续 Vite 引入新的 id 形态，应该把它作为新的 HMR CSS id 形态加进回归测试，而不是通过特殊处理输出目录来规避。
