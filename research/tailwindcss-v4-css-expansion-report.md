# Tailwind CSS v4 入口 CSS 展开流程报告

研究对象：`tailwindcss@4.3.2`，入口文件为 `node_modules/tailwindcss/index.css`。你贴出的 CSS 与这个入口结构一致：先声明 `@layer theme, base, components, utilities;`，再放 `@theme`、preflight base CSS，最后用 `@tailwind utilities` 作为工具类插入点。

## 结论

Tailwind v4 不是在看到 `@tailwind utilities;` 时立刻展开全部工具类。它先把入口 CSS 解析成 AST，收集 `@theme` 中的 token，创建 `designSystem`，把 `@tailwind utilities` 节点记录为 `utilitiesNode` 占位。真正生成工具类发生在 `compile(...).build(candidates)` 阶段，扫描器把实际用到的 class 候选传进来后，Tailwind 才调用 `compileCandidates()` 生成对应 CSS AST，并把这些节点塞回 `utilitiesNode`。

`@layer` 本身基本按标准 CSS Cascade Layers 保留。Tailwind v4 重点处理的是 `@theme`、`@source`、`@utility`、`@variant`、`@tailwind utilities` 等 Tailwind 指令；`@layer theme/base/utilities` 主要提供最终 CSS 的层级顺序和包裹位置。

## 入口 CSS 的处理阶段

### 阶段 0：解析 CSS 和 import

`compile(css)` 会先用 Tailwind 内部 CSS parser 把输入转成 AST，再进入 `compileAst()` / `parseCss()`。`parseCss()` 开始时会处理 `@import`，然后遍历所有 at-rule。

关键源码：`packages/tailwindcss/src/index.ts`

- `compile()` 解析 CSS：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L820-L840>
- `parseCss()` 初始化状态：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L142-L170>

### 阶段 1：处理 `@theme`

遇到 `@theme default { ... }` 时，Tailwind 会：

1. 解析参数里的 `default`、`inline`、`reference`、`static`、`prefix(...)`。
2. 要求 `@theme` 内部只能有 CSS 自定义属性或 `@keyframes`。
3. 把 `--color-*`、`--spacing`、`--text-*` 等变量登记到 `Theme` 对象。
4. 把第一个 `@theme` 节点替换成 `:root, :host` 规则，后续 `@theme` 节点删除。
5. 输出时跳过带 `reference` 标记的变量；`@keyframes` 会被提升出 `:root`。

所以入口里的：

```css
@layer theme {
  @theme default {
    --color-red-500: oklch(...);
  }
}
```

最终更接近：

```css
@layer theme {
  :root, :host {
    --color-red-500: oklch(...);
  }
}
```

关键源码：

- `@theme` 参数解析：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L90-L104>
- 收集 `@theme` 变量和 `@keyframes`：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L542-L595>
- 输出最终 theme 变量：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L650-L670>
- `Theme.resolve()` 决定返回 `var(...)` 还是 inline 值：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/theme.ts>

### 阶段 2：处理 `@layer base`

`@layer base` 里的 reset/preflight 是普通 CSS 规则。Tailwind 不会把它当成工具类重新生成；它只会在 `optimizeAst()` 里做通用 AST 优化，例如删除空规则、去重、追踪变量使用、处理 polyfill。

`@layer` 会被保留，即使是空 layer 也会打印为声明形式。这就是为什么没有任何工具类时，末尾可能变成：

```css
@layer utilities;
```

关键源码：

- 保留 `@layer` at-rule：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/ast.ts#L402-L410>
- 空 at-rule 打印成 `@layer ...;`：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/ast.ts#L770-L776>

### 阶段 3：记录 `@tailwind utilities`

`parseCss()` 遇到 `@tailwind utilities` 时，会：

1. 找到第一个 `@tailwind utilities`，把它保存为 `utilitiesNode`。
2. 删除重复的 `@tailwind utilities`。
3. 如果在 `@reference` 上下文里，直接删除它。
4. 解析可选的 `source(...)` 参数。
5. 标记 `Features.Utilities`。

这个阶段只“占位”，不生成类。

关键源码：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L174-L220>

之后 Tailwind 会把这个 at-rule 节点改成 `context` 节点，这样最终打印时只输出它的 children，也就是稍后生成的工具类规则。

关键源码：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L677-L683>

### 阶段 4：建立 designSystem

`buildDesignSystem(theme)` 会基于已经收集好的主题 token 创建：

- `utilities`：所有内置 static/functional 工具类生成器。
- `variants`：hover、focus、media、group 等变体生成器。
- candidate/variant 的解析缓存和编译缓存。

关键源码：

- 创建 utilities 和 variants：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/design-system.ts#L70-L80>
- candidate 编译缓存：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/design-system.ts#L82-L106>

工具类注册不是全量 CSS，而是注册生成函数：

- `staticUtility('flex', [['display', 'flex']])` 代表 `flex` 这种固定类。
- `spacingUtility('p', ['--padding', '--spacing'], ...)` 代表 `p-4` 这种依赖 spacing token 的类。
- `utilities.functional('bg', ...)` 代表 `bg-red-500`、`bg-[...]` 等多义背景类。
- `utilities.functional('text', ...)` 同时处理文本颜色和字号。

关键源码：

- static/functional/color/spacing utility 注册器：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/utilities.ts#L372-L570>
- `flex` 注册：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/utilities.ts#L956-L976>
- `bg-*` 处理：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/utilities.ts#L2899-L2945>
- `text-*` 处理：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/utilities.ts#L5275-L5380>

### 阶段 5：`build(candidates)` 展开工具类

扫描器或调用方把候选类传给 `build()`。流程是：

1. 累加新的 raw candidates，跳过已知无效项。
2. 调用 `compileCandidates(allValidCandidates, designSystem)`。
3. 把生成的 AST 节点写入 `utilitiesNode.nodes`。
4. 运行 `optimizeAst()`。
5. `toCss()` 把 AST 打印成最终 CSS 字符串。

关键源码：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/index.ts#L746-L814>

`compileCandidates()` 内部再做：

1. `designSystem.parseCandidate(rawCandidate)` 解析 class，例如 `hover:bg-blue-500` 会分成 variants 和 base utility。
2. `designSystem.compileAstNodes(candidate)` 生成 CSS AST。
3. 按 variant 顺序、属性顺序、属性数量、candidate 字母序排序。

关键源码：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/compile.ts#L11-L121>

`compileAstNodes()` 会：

1. 调 `compileBaseUtility()` 找到 candidate root 对应的 utility 生成函数。
2. 生成选择器 `.${escape(candidate.raw)}`。
3. 应用 `!important`。
4. 逐个应用 variants。

关键源码：

- 生成选择器并应用 variants：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/compile.ts#L123-L170>
- `compileBaseUtility()` 从 registry 找 utility：<https://github.com/tailwindlabs/tailwindcss/blob/v4.3.2/packages/tailwindcss/src/compile.ts#L270-L330>

## 本地验证实验

我用本地 `tailwindcss@4.3.2` 直接调用：

```js
import { compile } from 'tailwindcss'

const css = await fs.readFile('node_modules/tailwindcss/index.css', 'utf8')
const api = await compile(css, { base: process.cwd() })
const out = api.build(['flex', 'p-4', 'bg-red-500', 'text-sm', 'hover:bg-blue-500'])
```

关键输出：

```css
@layer utilities {
  .flex {
    display: flex;
  }
  .bg-red-500 {
    background-color: var(--color-red-500);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
  .hover\:bg-blue-500 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-blue-500);
      }
    }
  }
}
```

传入空 candidates 时，末尾不是全量工具类，而是：

```css
@layer utilities;
```

这说明 `@tailwind utilities` 是“候选类生成入口”，不是“把所有内置 utility 一次性展开”的宏。

## 对你贴的 CSS 的逐段解释

`@layer theme, base, components, utilities;`

声明 cascade layer 顺序。Tailwind 保留它，浏览器负责用这个顺序参与级联。

`@layer theme { @theme default { ... } }`

Tailwind 读取里面的 theme token，构造 `designSystem.theme`。输出时 `@theme` 块本身不保留，会变成 `:root, :host { --token: value; }`。带 `reference` 的 deprecated token 只参与解析，不直接输出变量声明。

`@layer base { ... }`

这是 preflight/reset。Tailwind 不按 candidate 生成它；它作为普通 CSS 留在 base 层，经过 AST 优化后输出。

`@layer utilities { @tailwind utilities; }`

这是工具类占位层。实际项目构建时，扫描器收集模板和脚本里的 class，传给 `build(candidates)`；只有这些 candidates 对应的工具类会插入这里。

## 和 weapp-tailwindcss 链路的关系

上面描述的是 Tailwind v4 官方编译器如何把入口 CSS 变成 Web CSS AST/CSS 字符串。`weapp-tailwindcss` 后续还会接管小程序选择器、特殊字符、安全类名、rpx/JS class 转译等小程序适配问题；这些不属于 Tailwind 官方 `@tailwind utilities` 展开阶段本身。

## 产物

- 注释版入口 CSS：[tailwindcss-v4-index.annotated.css](./tailwindcss-v4-index.annotated.css)
- 本报告：[tailwindcss-v4-css-expansion-report.md](./tailwindcss-v4-css-expansion-report.md)
