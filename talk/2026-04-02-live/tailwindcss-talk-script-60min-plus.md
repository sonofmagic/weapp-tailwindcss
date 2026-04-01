# 原子化 CSS 技术分享讲稿：60 分钟以上版

这是一份独立的纯口播讲稿，适合完整长讲，也适合拆成上下半场来讲。

## 现场使用方式

- `【页面】` 表示当前建议停留的大屏页面。
- `【操作】` 表示你讲到这里时，建议点击到的文档页。
- 这个版本建议你真的边讲边切页，不然信息量会过大，听众会失去锚点。

## 推荐点击路线

1. `/docs/tailwindcss`
2. `/docs/tailwindcss/css-origin-evolution`
3. `/docs/tailwindcss/history`
4. `/docs/tailwindcss/history/raw-css`
5. `/docs/tailwindcss/history/preprocessors`
6. `/docs/tailwindcss/history/css-modules`
7. `/docs/tailwindcss/history/css-in-js`
8. `/docs/tailwindcss/history/utility-first`
9. `/docs/tailwindcss/history/headless-tokens`
10. `/docs/tailwindcss/tailwind-core`
11. `/docs/tailwindcss/best-practices`
12. `/docs/tailwindcss/merge-and-variants`
13. `/docs/tailwindcss/shadcn-ui`
14. `/docs/tailwindcss/style-isolation`
15. `/docs/tailwindcss/tailwind-vs-unocss`
16. `/docs/tailwindcss/postcss`
17. `/docs/tailwindcss/ai-friendly-and-demos`
18. `/docs/tailwindcss/demos`

## 正式讲稿

【页面｜预计 5 分钟】

`/docs/tailwindcss`

大家好，今天这场分享，我想把原子化 CSS 这件事，从头到尾讲完整。

我不是想做一场“Tailwind 教程”。

我更想做的是，把这一整组技术专题里的核心脉络，完整地串起来。

也就是说，我们不只是看怎么配，不只是看怎么写，而是要一起回答一个更大的问题：

为什么今天前端样式工程，会越来越自然地走向原子化 CSS？

以及，Tailwind 这件事，到底应该被理解成一个工具，还是一种工程组织方式？

我先把结论说在前面。

我觉得 Tailwind 这几年之所以会变得越来越重要，不是因为它更“时髦”，也不是因为前端不想写 CSS 了。

而是因为前端工程在过去很多年里积累出来的一堆问题，刚好让这种组织方式越来越顺手。

所以今天我们如果还把 Tailwind 当成“一个类名很多的样式库”，那其实理解得太浅了。

它更像前端样式工程的一次重心迁移。

以前大家主要讨论的是：

样式写在哪。

今天越来越多团队在讨论的是：

样式约束放在哪。

我今天会分六个部分讲。

第一部分，样式方案为什么会不断演化。

第二部分，Tailwind 本质上到底是什么。

第三部分，为什么原子化 CSS 在组件工程里一定会走到 merge 和 variants。

第四部分，为什么 shadcn/ui 这种模式会成为事实标准。

第五部分，样式隔离、多端和平台边界怎么处理。

第六部分，AI 为什么会让 Tailwind 的工程价值更明显。

【操作｜切页约 15 秒】

如果你希望先把“CSS 为什么会走到今天”讲得更完整，先点到：

`/docs/tailwindcss/css-origin-evolution`

讲完背景之后，再回到：

`/docs/tailwindcss/history`

【这一段｜预计 4 分钟】

我们先讲第一部分。

也就是，样式方案为什么会不断演化。

如果把时间线拉长一点看，CSS 最早诞生时，解决的是一个非常根本的问题。

那就是 HTML 的表现和结构耦合得太紧了。

早期网页会直接用 `<font>`，会用 table 布局，会用很多浏览器私有标签去控制视觉。

CSS 的出现，本质上是在做一件现在看起来理所当然、但当时非常重要的事：

把表现层，从结构层剥出来。

【操作｜切页约 10 秒】

这里切到：

`/docs/tailwindcss/history`

【这一段｜预计 5 分钟】

后来 CSS 自身一直在变强。

布局能力从 table 到 float，再到 Flexbox、Grid。

响应式从媒体查询走到容器查询。

可维护性从命名约定走到变量、层级、逻辑选择器和构建工具。

换句话说，CSS 自己一直在进化。

但与此同时，项目复杂度也一直在变高。

在项目规模很小时，Raw CSS 完全够用。

你写全局 class，配一个 reset 或 normalize，就能做页面。

再加上 BEM 或 OOCSS 这种命名方法论，已经足够支撑很多中小项目。

但问题一旦进入团队协作和长期维护阶段，就会开始集中暴露。

全局污染。

覆盖链条。

命名分叉。

样式漂移。

这些问题一般不会在第一周出现。

它们通常会在半年之后一起出现。

【操作｜切页约 10 秒】

点到：

`/docs/tailwindcss/history/raw-css`

【这一段｜预计 3 分钟】

于是大家开始引入预处理器。

Sass 和 Less 解决了变量、混入、函数、嵌套的问题。

样式第一次明显更像“工程代码”。

但预处理器也没有消灭问题。

只是把问题往后推。

因为它的本质还是全局样式。

你只是用更强的语言，在生成同样可能失控的全局 CSS。

【操作｜切页约 10 秒】

点到：

`/docs/tailwindcss/history/preprocessors`

【这一段｜预计 3 分钟】

再往后，CSS Modules 出现了。

这个阶段很关键。

因为大家开始不再只依赖人脑维护命名，而是让编译器来保证作用域隔离。

类名哈希化以后，全局污染立刻减轻很多。

这对中大型应用和组件库，意义非常大。

【操作｜切页约 10 秒】

点到：

`/docs/tailwindcss/history/css-modules`

【这一段｜预计 4 分钟】

但 CSS Modules 也带来了新的成本。

跨组件复用不再像全局 class 那么直接。

主题切换更依赖 token 设计。

抽象层会变多。

然后到了 CSS-in-JS 阶段。

这个阶段的重点，是把样式和组件状态真正绑在一起。

对于多品牌、多主题、动态样式很多的设计系统，这条路非常合理。

但它的代价也非常真实。

运行时成本。

SSR 注水。

构建复杂度。

调试体验。

都会上来。

【操作｜切页约 15 秒】

点到：

`/docs/tailwindcss/history/css-in-js`

最后才是 Utility-first。

也就是 Tailwind、UnoCSS 这一类。

它们没有发明组件化，也没有发明主题化。

但它们把前面这些阶段留下来的几个关键诉求，整合到了一起。

它们特别适合现代工程，因为它们很容易和 tokens、JIT、构建裁剪、变体工厂、组件语义以及 AI 生成结合起来。

但我这里要反复强调一个特别重要的点。

这不是一条单线替代史。

不是说有了 Tailwind，前面的方案就都死掉了。

今天真实的前端世界，是多方案并存。

CSS Modules 依然常见。

Sass 在很多存量项目里依然好用。

CSS-in-JS 在设计系统里依然很强。

Tailwind 只是其中一条，在当前生态里非常强的路线。

【操作】

点到：

`/docs/tailwindcss/history/utility-first`

然后补一页：

`/docs/tailwindcss/history/headless-tokens`

【这一段｜预计 5 分钟】

所以如果我们要做技术选型，真正应该问的不是“谁最好”。

而是“在我们的项目里，最大的约束是什么”。

如果你做的是内容站点，也许根本不需要那么强的原子化约束。

如果你做的是多端项目、组件库，或者想把 AI 接进来，那 Tailwind 的优势就会迅速放大。

接下来讲第二部分。

Tailwind 本质上到底是什么。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/tailwind-core`

【这一段｜预计 7 分钟】

我很不喜欢把 Tailwind 简化成一句：

把 CSS 写进 className。

这句话对初学者有帮助。

但对工程理解，其实是有伤害的。

因为它会让人忽略掉 Tailwind 最重要的部分。

Tailwind 真正的核心，是把设计系统压成原子类，再让组件接口重新长出语义。

你可以把它理解成三段。

第一段，入口。

入口不是 class，而是 tokens。

颜色、间距、圆角、字号、阴影、动效，这些设计决策应该先被抽象成 token，而不是等到业务组件里再临时决定。

第二段，中段。

中段是生成机制。

Tailwind 通过 content 扫描收集模板里的类名。

JIT 只生成真正用到的 CSS。

插件体系可以扩展能力。

`@layer` 可以管理层级。

`@apply` 可以做稳定复用。

第三段，出口。

出口不是 utility 本身。

而是组件语义。

也就是说，最终落到业务里的，不应该是一坨越来越长的 className。

而应该是有默认值、有变体、有边界的组件 API。

所以 Tailwind 真正的优势，不在于它让你少写了几行 CSS。

而在于它让设计约束、类名组合、组件封装和构建产物之间，更容易建立可验证的关系。

这一点如果理解了，后面很多问题都会变得清楚。

比如为什么 Tailwind 很适合设计系统。

因为 token 先行以后，utility 就变成了一种可复用、可分析、可约束的中间语言。

再比如为什么它适合 AI。

因为类名粒度稳定，约束边界容易显式表达。

【操作｜切页约 10 秒】

讲到“怎么落地”之前，切到：

`/docs/tailwindcss/best-practices`

【这一段｜预计 5 分钟】

接下来讲第三部分。

也就是，为什么 Tailwind 很容易被用乱。

原因特别现实。

它太容易开始了。

你几乎装上就能写页面。

前期反馈又特别快。

于是很多团队会直接跳过一整层中间建设。

也就是：

tokens 没抽。

builder 没建。

merge 没接。

content 没收紧。

评审规则也没立。

这种情况下，Tailwind 一开始当然会很爽。

但是组件一多、状态一多、协作者一多，就会迅速变成另一种形式的混乱。

不是全局 class 冲突。

而是 className 漂移。

不是嵌套地狱。

而是关系类地狱。

不是 CSS 文件臃肿。

而是业务组件里状态散落。

所以 Tailwind 最大的误区，就是让团队误以为：

它这么快，所以不需要结构。

实际上，它特别需要结构。

而且这层结构，比传统 CSS 时代更重要。

【操作｜切页约 5 秒】

继续停留在：

`/docs/tailwindcss/best-practices`

【这一段｜预计 1 分钟】

这时候就进入第四部分。

也就是 merge 和 variants。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/merge-and-variants`

【这一段｜预计 8 分钟】

我觉得 `tailwind-merge` 是很多团队低估的一个包。

只要你的组件允许外部传 `className`。

只要你希望“调用方最后的意图生效”。

你就几乎一定需要它。

因为 Tailwind 最终生成 CSS 的覆盖关系，不是简单看字符串顺序。

而是看它内部的排序规则。

也就是说，你写 `p-4 p-2`，并不代表 `p-2` 一定生效。

如果不先把冲突类删掉，组件开放覆盖入口本身，就会变成不稳定因素。

所以 `tailwind-merge` 不是锦上添花。

而是组件可扩展性的基础设施。

接下来是 `cva` 和 `tailwind-variants`。

我更愿意把它们理解成 builder。

不是小工具，而是结构层。

它们做的事情，是把 `size`、`tone`、`state`、`interactive` 这些变化维度，从业务组件里抽出来，集中到一个地方声明。

`cva` 更适合单槽组件。

比如按钮、Badge、Input。

`tailwind-variants` 更适合多槽组件。

比如 Card、Modal、Menu。

它们和 `tailwind-merge` 结合以后，才真正把 Tailwind 从“页面写法”提升到“组件工程”。

这时候再回头看 shadcn/ui，它为什么会那么有影响力，就很好理解了。

它推广的是一种模式，而不是一套视觉皮肤。

底层用 Radix 这类 headless primitives 负责交互和可访问性。

视觉层用 Tailwind。

变体层用 `cva` 或 `tailwind-variants`。

覆盖关系用 `tailwind-merge`。

最后把源码直接复制进项目，而不是单纯依赖一个 npm 包。

这套模式最重要的改变，是组件所有权的转移。

过去我们习惯的是等上游 UI 库发版。

现在越来越多团队会选择，把组件直接放进仓库里，由自己维护。

这对安全审计、品牌定制、主题演进和长期维护都非常重要。

【操作｜切页约 10 秒】

切到：

`/docs/tailwindcss/shadcn-ui`

【这一段｜预计 3 分钟】

也正因为这样，Headless 组件这条路线会越来越合理。

Radix 不是唯一选项。

Headless UI、Ark UI、Ariakit、React Aria 都可以。

关键不是选谁。

关键是你有没有真正把交互层和视觉层拆开。

接下来讲第五部分。

也就是样式隔离和平台边界。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/style-isolation`

【这一段｜预计 6 分钟】

当 Tailwind 用在普通应用页面里时，问题通常不大。

但只要场景切到组件库、微前端、Widget、第三方嵌入，样式边界就会变成核心问题。

专题里给了几类方案。

第一类，命名空间。

也就是 `prefix` 加 `important`。

这是最轻量的隔离方式。

它没有改变层叠本质，但能显著降低宿主污染。

第二类，编译期哈希。

比如 CSS Modules、vanilla-extract。

它适合需要隔离、但不想引入运行时的场景，尤其是组件库。

第三类，作用域容器。

比如 `data-*`、`:where`、未来的 `@scope`。

这类方式适合局部区域并存。

第四类，Shadow DOM 和 iframe。

这是最强隔离。

但也会带来样式注入和运行时边界成本。

还有一类经常被忽略的，是 preflight 控制。

很多冲突，其实不是 utility 本身造成的，而是 reset 先把宿主页面改了。

所以样式隔离这件事，本质上不是“选一个更高级的技术”。

而是“根据边界强度，选合适的成本”。

再讲一个今天非常现实的比较。

Tailwind 和 UnoCSS 怎么选。

如果从工程视角看，我觉得它们的差异非常清楚。

Tailwind 的优势，是现成生态、IDE 支持、官方插件、merge 规则和社区范式。

UnoCSS 的优势，是规则自由度、preset 机制和定制能力。

所以如果一个团队不想自养规则系统、提示系统和 merge 逻辑，Tailwind 会更稳。

如果一个团队本身就想把样式语言做成内部 DSL，而且愿意长期维护 preset 仓库，那 UnoCSS 会非常强。

这不是技术先进性比较。

这是维护模式比较。

【操作｜切页约 15 秒】

这里切到：

`/docs/tailwindcss/tailwind-vs-unocss`

如果你准备补一下构建链，再顺手切到：

`/docs/tailwindcss/postcss`

【这一段｜预计 1 分钟】

最后讲第六部分。

也就是 AI。

我觉得 AI 会让 Tailwind 这条路线的工程价值，变得更明显。

因为原子类天然适合模型生成。

它们结构稳定。

组合清晰。

词汇一致。

不像大量自定义样式那样高度随意。

但是一定要记住：

适合生成，不等于适合交付。

如果没有约束，AI 只会更快地产出一堆“看起来差不多”的代码。

它会乱写裸色值。

乱拼动态类。

乱用 `group` 和 `peer`。

然后把问题丢给后面的人收拾。

所以正确做法，不是“让 AI 自由写 Tailwind”。

而是给它完整上下文。

要告诉它：

我们有哪些 tokens。

我们有哪些现成组件。

哪些状态必须走 `aria-*` 或 `data-*`。

哪些写法禁止出现。

输出后必须经过 `cn`、`tailwind-merge`、lint、build 和人工抽查。

当这些护栏都在的时候，AI 才会真正变成生产力。

【操作｜切页约 10 秒】

点击：

`/docs/tailwindcss/ai-friendly-and-demos`

【这一段｜预计 6 分钟】

而且这里有一个非常关键的反转。

很多人以为 AI 会让工程约束没那么重要。

其实完全相反。

AI 出现以后，工程约束只会更重要。

因为原来人类写乱，速度还有限。

现在 AI 写乱，会更快、更大规模。

所以原子化 CSS 在今天的意义，比几年前更强。

不是因为类名更流行。

而是因为它更适合作为一门：

可约束。

可验证。

可生成。

的样式语言。

最后我做一个整体总结。

如果今天要把这一整组专题内容，压成一句最核心的话，那就是：

前端样式工程的重点，正在从“样式写在哪”，迁移到“样式约束放在哪”。

Raw CSS、Sass、CSS Modules、CSS-in-JS、Tailwind，它们各自都在回答这个问题。

只是回答方式不同。

Tailwind 的优势，不是它替代了所有人。

而是它在今天这个多 runtime、多协作、多 AI 的环境里，特别适合作为工程中间层。

但它只有在四个前提都成立时，才会真正强起来。

第一，有 token。

第二，有 builder。

也就是 `cva` 或 `tailwind-variants` 这种变体层。

第三，有 merge。

也就是 `tailwind-merge`。

第四，有验证链。

也就是 content、lint、构建、review 和 AI 护栏。

没有这些，Tailwind 只是另一种会失控的写法。

有了这些，Tailwind 才会从“utility classes”，升级成“样式工程基础设施”。

所以如果今天你让我给团队一个落地建议，我会这样说。

不要先讨论类名喜不喜欢看。

先讨论我们有没有准备好 tokens、variants、merge、review 和构建验证。

如果这些准备好了，Tailwind 非常值得用。

如果这些准备还没有到位，那就先把约束层补起来，再谈原子化。

这就是我想通过这一整组专题，最后提炼出来的核心结论。

【操作｜切页约 10 秒】

最后停在：

`/docs/tailwindcss/demos`

这时候最适合接实机演示、代码对照或者问答。

谢谢大家。
