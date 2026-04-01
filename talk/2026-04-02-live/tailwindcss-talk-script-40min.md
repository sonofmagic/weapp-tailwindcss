# 原子化 CSS 技术分享讲稿：40 分钟版

这是一份独立的纯口播讲稿，适合完整展开技术脉络，也适合现场按节奏跳读。

## 现场使用方式

- `【页面】` 表示当前大屏建议停留的页面。
- `【操作】` 表示讲到这里时建议点击到的文档页。
- 这个版本适合“边讲边翻页”，把左侧 sidebar 当成你的现场提词器。

## 推荐点击路线

1. `/docs/tailwindcss`
2. `/docs/tailwindcss/history`
3. `/docs/tailwindcss/history/raw-css`
4. `/docs/tailwindcss/history/preprocessors`
5. `/docs/tailwindcss/history/css-modules`
6. `/docs/tailwindcss/history/css-in-js`
7. `/docs/tailwindcss/history/utility-first`
8. `/docs/tailwindcss/history/headless-tokens`
9. `/docs/tailwindcss/tailwind-core`
10. `/docs/tailwindcss/best-practices`
11. `/docs/tailwindcss/merge-and-variants`
12. `/docs/tailwindcss/style-isolation`
13. `/docs/tailwindcss/tailwind-vs-unocss`
14. `/docs/tailwindcss/shadcn-ui`
15. `/docs/tailwindcss/ai-friendly-and-demos`
16. `/docs/tailwindcss/demos`

## 正式讲稿

【页面｜预计 4 分钟】

`/docs/tailwindcss`

大家好，今天这次分享，我想系统地讲一遍原子化 CSS。

尤其是 Tailwind 这条路线。

我想讲清楚四件事。

第一，前端样式方案为什么会不断演进。

第二，Tailwind 到底是一个写法偏好，还是一种工程组织方式。

第三，为什么很多团队用了 Tailwind 之后，反而会越来越乱。

第四，在 AI 开始参与写 UI 的今天，原子化 CSS 为什么反而更值得重新看一遍。

我先说结论。

我觉得 Tailwind 这几年会越来越流行，不是因为大家突然不想写 CSS 了。

而是因为前端工程里几个越来越重要的问题，它都刚好比较顺手。

比如设计约束。

比如组件变体。

比如构建产物控制。

比如多协作者协作。

比如 AI 生成代码之后，怎么接回正式工程。

所以今天我们不要把 Tailwind 当成“一个样式库”来看。

它更像一种工程中间层。

那我们先从历史开始讲。

【操作｜切页约 10 秒】

点击「样式方案的演化」：

`/docs/tailwindcss/history`

【这一段｜预计 3 分钟】

如果回头看前端样式方案的发展，大概会经过几个阶段。

最早是 Raw CSS。

优点很明显，直接，简单，没有什么门槛。

问题也很明显，全局污染、覆盖链条、命名冲突，项目一大就很难控制。

【操作｜切页约 10 秒】

这里往下点到历史子页：

`/docs/tailwindcss/history/raw-css`

【这一段｜预计 3 分钟】

然后是 BEM 和 OOCSS。

这两套方法论，其实不是在发明新技术。

它们是在试图解决一个现实问题：

如果大家都写全局 CSS，那能不能至少靠命名和结构约定，让混乱晚一点到来。

再往后是预处理器。

Sass、Less 让变量、混入、函数、嵌套这些能力进入前端，样式第一次明显更像“工程代码”。

但问题并没有被消灭，只是变了个样子。

因为它们的本质还是全局 CSS。

你只是用更强的语言，在生成同样可能失控的样式。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/history/preprocessors`

【这一段｜预计 2 分钟】

然后进入 CSS Modules 阶段。

这个阶段最关键的变化，是作用域开始由编译器来保障，而不是完全靠人脑维护命名。

哈希类名一上来，全局污染立刻减轻很多。

所以 CSS Modules 对中大型应用和组件库，意义非常大。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/history/css-modules`

【这一段｜预计 2 分钟】

再往后是 CSS-in-JS。

这个阶段的重点，是把样式和组件状态绑得更紧。

这对于多主题、多品牌、动态样式很多的设计系统，非常有吸引力。

但代价也很真实。

运行时成本。

SSR 注水。

构建链复杂度。

调试体验。

这些都会上来。

【操作｜切页约 15 秒】

点击：

`/docs/tailwindcss/history/css-in-js`

最后才是 Utility-first。

也就是 Tailwind、UnoCSS 这一类。

我要强调一下，它们不是凭空出现的。

它们其实是在接前面这些阶段留下来的共同问题。

大家慢慢发现，真正难的不是“样式能不能写出来”。

真正难的是“样式约束能不能被稳定复用和审阅”。

所以组织方式开始变化。

从命名 class，转向组合 class。

从局部抽象，转向 tokens 和 variants。

从运行时解释，转向构建期裁剪和生成。

但这里特别容易讲错。

我要直接说清楚：

这不是一条线性替代史。

不是说 Tailwind 出现了，前面的方案就都输了。

现实更接近多方案并行。

Next.js 到今天依然把 Tailwind、CSS Modules、Sass、Global CSS、CSS-in-JS 并列列成可选方案。

所以我们做技术选型，不应该问“谁赢了”，而应该问“什么场景下，谁更合适”。

【操作】

点到：

`/docs/tailwindcss/history/utility-first`

如果你想顺手补一页组件工程的延伸，就再点：

`/docs/tailwindcss/history/headless-tokens`

【这一段｜预计 5 分钟】

讲完这个背景，我们再看 Tailwind 本身。

【操作｜切页约 10 秒】

点击「Tailwind 设计理念」：

`/docs/tailwindcss/tailwind-core`

【这一段｜预计 7 分钟】

很多人第一次接触 Tailwind，会把它理解成“把 CSS 写进 className 里”。

这个理解对入门有帮助，但对工程理解其实不够。

因为 Tailwind 真正的核心，不是 class 这个表面。

而是它背后的整条链路。

我会把它拆成三段。

第一段，入口。

入口不是 class，而是 tokens。

颜色、间距、圆角、字号、阴影、动效，这些值应该先被收敛成 token，而不是等到业务组件里再临时决定。

第二段，中段。

中段是生成机制。

Tailwind 通过 content 扫描模板里的类名，JIT 只生成真正需要的 CSS。

插件可以扩展规则。

`@layer` 可以管理层级。

`@apply` 可以做稳定复用。

第三段，出口。

出口不是 utility 本身，而是组件语义。

也就是说，最后落到业务里的，不应该是一坨越来越长的 className。

而应该是有默认值、有变体、有边界的组件 API。

这就是为什么我会说，Tailwind 真正解决的，不只是“少写 CSS”。

它真正解决的是：

怎么让设计约束、类名组合、组件语义和构建产物之间，更容易对齐。

但问题来了。

既然它这么强，为什么很多团队还是会把 Tailwind 用乱？

原因很简单。

它太容易开始了。

你安装完几乎马上就能写页面。

反馈又很快。

于是很多团队会直接跳过一整层中间建设。

也就是：

tokens 没抽。

builder 没建。

merge 没接。

content 没收紧。

评审规则也没立。

这种情况下，Tailwind 前期当然很爽。

但后面问题会慢慢全部回来。

类名越来越长。

关系类越来越深。

状态散落在很多业务组件里。

动态类开始用字符串拼接。

评审时每段代码都像是“能跑”，但很难判断是不是长期正确。

所以 Tailwind 最大的误区，就是让团队误以为：

它这么快，所以不需要结构。

实际上，它特别需要结构。

而且这层结构，比传统 CSS 时代更重要。

【操作｜切页约 10 秒】

点击「原子化 CSS 最佳实践」：

`/docs/tailwindcss/best-practices`

【这一段｜预计 5 分钟】

这个结构，我觉得至少包括四件事。

第一，tokens。

不要在业务组件里到处写裸色值、裸字号、裸间距。

应该先有一份设计 token。

这样未来改主题、改品牌、做暗色模式，改的是映射，不是全项目搜字符串。

第二，variants。

只要组件有 `size`、`tone`、`state`、`intent` 这些维度，就不要把它们散落在业务组件里。

应该集中到 builder 层。

比如 `cva` 或 `tailwind-variants`。

这样默认值、复合状态和边界都在一个地方。

第三，merge。

这个点特别关键。

`tailwind-merge` 不是一个小补丁。

它解决的是 Tailwind 类冲突和外部覆盖的可预测性问题。

因为 Tailwind 最终生成 CSS 的顺序，并不简单取决于你 class 字符串的顺序。

如果没有 merge，组件允许外部传 `className` 的那一刻起，就已经埋下了不稳定因素。

第四，content 和构建验证。

Tailwind 的问题很多时候不在运行时，而在构建时。

扫描范围太宽，动态类自由拼接，关系类过深，都会让产物失控。

所以一套成熟的 Tailwind 工程，不只是有 `tailwind.config.ts`。

还必须有 lint、merge、体积检查、人工 review 这些验证环节。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/merge-and-variants`

【这一段｜预计 5 分钟】

讲到这里，我们就能顺着看 `tailwind-merge`、`cva` 和 `tailwind-variants` 这一层。

我觉得它们就是 Tailwind 真正进入组件工程的桥。

`tailwind-merge` 负责冲突去重和覆盖关系。

`cva` 更适合单槽组件。

比如按钮、徽标、输入框。

`tailwind-variants` 更适合多槽组件。

比如卡片、菜单、弹窗。

它们共同做的事情，是把原子类从“页面写法”，抬升到“组件 API”。

也正因为这样，shadcn/ui 才会有那么大影响。

它最重要的地方，不是它的视觉风格。

而是它推广了一种模式。

底层用 Radix 这类无样式交互 primitives。

视觉层用 Tailwind。

变体层用 `cva` 或 `tailwind-variants`。

覆盖关系用 `tailwind-merge`。

最后把源码直接复制进项目，而不是单纯依赖一个 npm 包。

这个模式最重要的变化，就是组件所有权回到了团队自己手里。

以前很多团队会觉得组件库就是“装一个包”。

现在越来越多团队会觉得，组件库应该是“把一套成熟模式落到仓库里，然后自己维护”。

这时候再往外看，你就会发现 Headless 组件这条路线，其实越来越合理。

Radix 不是唯一选项。

Headless UI、Ark UI、Ariakit、React Aria，都可以。

关键不是选谁。

关键是你有没有真正把交互层和视觉层拆开。

【操作｜切页约 10 秒】

讲完这一段，切到：

`/docs/tailwindcss/shadcn-ui`

【这一段｜预计 2 分钟】

接下来再看一个经常被忽略、但其实很现实的话题：

样式隔离。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/style-isolation`

【这一段｜预计 4 分钟】

Tailwind 用在普通应用页面里，问题往往不大。

但一旦进入组件库、微前端、Widget、第三方嵌入，样式边界立刻就会变成核心问题。

专题里给了几类方案。

最轻量的是命名空间，也就是 `prefix` 加 `important`。

再往上是编译期哈希，比如 CSS Modules、vanilla-extract。

再强一点是作用域容器，比如 `data-*`、`:where`，以及未来的 `@scope`。

最强的是 Shadow DOM 或 iframe。

还有一条经常被忽略的，是 preflight 控制。

很多冲突其实不是 utility 本身造成的，而是 reset 先把宿主页面改了。

所以样式隔离没有银弹。

它不是“选一个更高级的技术”。

而是“根据边界强度选合适的成本”。

再讲一个今天大家一定会问的问题。

Tailwind 和 UnoCSS 怎么选？

我觉得从工程视角看，它们的差异其实很清楚。

Tailwind 的优势，是现成生态、IDE 支持、官方插件、merge 规则和大量社区范式。

UnoCSS 的优势，是规则自由度、preset 机制和定制能力。

所以如果一个团队不想自养规则系统、提示系统和 merge 逻辑，Tailwind 会更稳。

如果一个团队本身就想把样式语言做成内部 DSL，而且愿意长期维护 preset 仓库，那 UnoCSS 会非常强。

这不是技术先进性比较。

这本质上是维护模式比较。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/tailwind-vs-unocss`

【这一段｜预计 4 分钟】

最后讲 AI。

我觉得 AI 会让 Tailwind 这条路线的工程价值变得更明显。

原因很简单。

原子类天然适合模型生成。

它们结构稳定。

组合清晰。

词汇一致。

不像大量自定义样式那样高度随意。

但一定要记住：

适合生成，不等于适合交付。

如果没有约束，AI 只会更快地产出一堆“看起来差不多”的代码。

它会乱写裸色值。

乱拼动态类。

乱用 `group` 和 `peer`。

然后把问题丢给后面的人收拾。

所以正确做法，不是“让 AI 自由写 Tailwind”。

而是给它完整上下文。

告诉它有哪些 tokens。

有哪些已有组件。

哪些状态必须走 `aria-*` 或 `data-*`。

哪些写法禁止出现。

输出后还必须经过 `cn`、`tailwind-merge`、lint、build 和人工抽查。

当这些护栏都在的时候，AI 才会真正变成生产力。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/ai-friendly-and-demos`

【这一段｜预计 3 分钟】

而且这里有一个很有意思的反转。

很多人以为 AI 会让工程约束没那么重要。

实际上恰恰相反。

AI 出现以后，工程约束只会更重要。

因为原来人类写乱，速度还有限。

现在 AI 写乱，会更快、更大规模。

所以原子化 CSS 在今天的意义，比几年前更强。

不是因为类名更流行了。

而是因为它更适合作为一门可约束、可验证、可生成的样式语言。

最后我做个总结。

如果今天这场分享，只留下三句话，我希望是这三句。

第一，样式方案没有唯一正确答案，只有场景匹配。

第二，Tailwind 真正的价值，不是少写 CSS，而是更容易把 tokens、variants、merge、组件语义和构建验证串成一条完整链路。

第三，原子化 CSS 只有在建立约束之后，才会从“快速写法”升级成“稳定工作流”。

所以如果今天你在评估 Tailwind，不要只问“类名多不多”。

要问的是：

我们有没有准备好 token、builder、merge、content、review 和 AI 护栏这几层。

如果这些层都在，Tailwind 会非常强。

如果这些层不在，它也会很快失控。

这就是我今天想讲的核心。

【操作｜切页约 10 秒】

结束前切到：

`/docs/tailwindcss/demos`

如果后面要接现场跑代码，这一页正好是自然落点。

谢谢大家。
