# 原子化 CSS 技术分享讲稿：20 分钟版

这是一份独立的纯口播讲稿，适合现场直接照着讲，也适合按节奏自行增减段落。

## 现场使用方式

- `【页面】` 表示当前大屏建议停留的文档页。
- `【操作】` 表示你讲到这里时，建议在文档站里点到下一个页面。
- 如果现场节奏更快，可以只保留 `index`、`history`、`tailwind-core`、`best-practices`、`merge-and-variants`、`ai-friendly-and-demos` 这 6 个停靠点。

## 推荐点击路线

1. `/docs/tailwindcss`
2. `/docs/tailwindcss/history`
3. `/docs/tailwindcss/tailwind-core`
4. `/docs/tailwindcss/best-practices`
5. `/docs/tailwindcss/merge-and-variants`
6. `/docs/tailwindcss/shadcn-ui`
7. `/docs/tailwindcss/ai-friendly-and-demos`
8. `/docs/tailwindcss/demos`

## 正式讲稿

【页面｜预计 4 分钟】

`/docs/tailwindcss`

大家好，今天我想讲一个其实很多人都在用，但不一定真的想清楚的问题。

这个问题就是：

为什么今天越来越多团队，会走向原子化 CSS？

以及，Tailwind 这种方案，到底值不值得认真对待？

我先不讲配置，也不讲 API。

我先给一个我自己的结论。

原子化 CSS 真正的价值，从来不只是“少写 CSS”。

如果只是为了少写几行样式，那很多方案都能做到。

Tailwind 真正厉害的地方，是它很容易把几件原本比较散的事情，收成一条工程链路。

比如设计约束。

比如类名组合。

比如组件封装。

比如构建产物。

甚至现在连 AI 生成代码，也能比较自然地接进来。

所以，如果今天你还把 Tailwind 理解成“一个类名很多的样式库”，那其实只看到了最表面的一层。

它更像一种组织样式的工程方法。

那要理解这件事，我们得先把它放回历史里看。

【操作｜切页约 10 秒】

点击左侧「样式方案的演化」，进入：

`/docs/tailwindcss/history`

【这一段｜预计 4 分钟】

前端样式方案，常见的发展路线，大概是这样的。

最早是 Raw CSS。

就是大家手写全局样式，靠命名约定和经验维持秩序。

然后是 Sass、Less 这样的预处理器，开始解决变量、混入和复用的问题。

再往后是 CSS Modules，把样式隔离交给编译器。

再之后是 CSS-in-JS，把样式和组件状态绑得更紧。

最后才是 Utility-first，也就是 Tailwind、UnoCSS 这样的原子化方案。

但这里我要停一下。

这个顺序，不代表线性替代。

不是说 Tailwind 出现了，前面的东西就都过时了。

现实不是这样。

现实是，这些方案今天依然并行存在。

内容站点、小项目、组件库、设计系统、微前端，它们各自最合适的方案，本来就不一样。

那为什么这几年 Utility-first 会越来越常见？

因为它刚好特别适合现代前端的几个高频需求。

第一，它跟 design tokens 很容易对齐。

第二，它跟 JIT 和 content 扫描结合以后，产物比较好控。

第三，它很适合跟 `cva`、`tailwind-variants` 这种变体工厂结合。

第四，它对 AI 特别友好，因为原子类本身就是比较稳定、低歧义、可组合的语料。

但是，问题也在这里。

【操作｜切页约 10 秒】

点击左侧「Tailwind 设计理念」，进入：

`/docs/tailwindcss/tailwind-core`

【这一段｜预计 5 分钟】

原子化 CSS 很容易上手，所以也很容易被用乱。

很多团队一开始会觉得特别爽。

写页面快。

改 UI 也快。

然后过几个月，就开始出问题。

类名越来越长。

状态越来越散。

动态类越来越多。

评审越来越痛苦。

然后就有人下结论，说 Tailwind 只适合小项目。

但我觉得，不是这样的。

真正的问题不是 Tailwind 不行。

而是中间缺了一层约束。

这层约束，我觉得至少有三件事。

第一，先建设计体系，再写类名。

不要让每个组件自己发明颜色、间距和圆角。

色板、字号、间距、阴影这些值，应该先抽成 tokens。

不要在业务组件里到处写裸值。

第二，先收敛组件变体，再谈复用。

按钮、卡片、输入框，只要有 `size`、`tone`、`state` 这种变化，就应该集中到 `cva` 或 `tailwind-variants` 里。

不要在业务组件里反复拼大串 class。

第三，先验证产物，再相信感觉。

Tailwind 很多问题，不在运行时，而在构建阶段。

`content` 范围写太宽，动态类自由拼接，关系类嵌套太深，最后都会让 CSS 膨胀，让代码越来越难维护。

这里我还想单独点一个包。

就是 `tailwind-merge`。

很多人觉得它只是个小工具。

但只要你的组件允许外部传 `className` 覆盖，它就不是可选项，而是基础设施。

因为 Tailwind 最终的覆盖关系，不是简单按你 class 的先后顺序决定的，而是按它内部生成规则排序的。

所以如果没有 merge，你以为“最后一个类会生效”，其实未必。

这也是为什么我会说，一条成熟的 Tailwind 工程链路，应该长成这样：

先有 tokens。

再有原子类。

再有 variants builder。

再有组件。

然后靠 content 精准扫描驱动 JIT。

最后再用 `tailwind-merge` 保证覆盖结果可预期。

这样 Tailwind 才真正从“写样式方式”，变成“组件工程的一部分”。

【操作｜切页约 10 秒】

点击左侧「原子化 CSS 最佳实践」，进入：

`/docs/tailwindcss/best-practices`

【这一段｜预计 2 分钟】

讲到这里，我们就能顺着理解，为什么 shadcn/ui 会有这么大影响力。

它的重要性，不在于它长得有多好看。

而在于它把一种模式推广开了。

无样式交互基座，比如 Radix。

再加 Tailwind 负责视觉。

再加 `tailwind-merge` 和 `cva` 负责变体和覆盖。

最后把源码直接放进项目里。

这个模式本质上是在说：

组件的所有权，应该回到团队自己手里。

【操作｜切页约 15 秒】

这里可以先点到「tailwind-merge、cva、tailwind-variants 精要」，停一下：

`/docs/tailwindcss/merge-and-variants`

然后顺手再点到：

`/docs/tailwindcss/shadcn-ui`

【这一段｜预计 2 分钟】

再往后一步，就是 AI。

原子类为什么适合 AI？

不是因为模型特别喜欢 Tailwind。

而是因为它更容易被约束。

你可以告诉模型，只能用哪些 tokens，只能用哪些组件，只能走哪些 variants。

你可以禁止它去拼任意动态类。

然后再用 lint、merge、build 和人工 review 去兜底。

这样 AI 写出来的代码，才可能进入正式工程。

【操作｜切页约 10 秒】

点击左侧「AI 友好提示与 Demo 运行指南」，进入：

`/docs/tailwindcss/ai-friendly-and-demos`

【这一段｜预计 3 分钟】

最后我收个尾。

今天这场分享，我最想留下的一句话是：

不要把原子化 CSS 当成“省事的写法”。

要把它当成“更容易建立工程约束的入口”。

如果你的项目还很小，Raw CSS、BEM、Modules 都完全可以继续用。

如果你已经进入组件化和设计系统阶段，Tailwind 的价值会越来越明显。

但不管选哪条路，真正决定上限的，都不是类名形式。

而是 tokens、组件边界、变体管理和验证链。

当你这么理解它的时候，Tailwind 这件事，才算真的讲明白。

【操作｜切页约 10 秒】

收尾时切到：

`/docs/tailwindcss/demos`

停在 Demo 总览页结束，方便后面自然接演示或者问答。

谢谢大家。
