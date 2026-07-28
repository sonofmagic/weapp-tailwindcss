# Core API 与构建生命周期

## 适用边界

普通 uni-app、Taro、Mpx、weapp-vite 或原生 Gulp 项目优先用对应插件。Core API 适合自研 bundler、批处理平台或需要掌管内存产物的适配器。

## 上下文

```ts
import path from 'node:path'
import { createContext } from 'weapp-tailwindcss/core'

const root = process.cwd()
const ctx = createContext({
  tailwindcssBasedir: root,
  cssEntries: [path.resolve(root, 'src/tailwind.css')],
})
```

一个构建周期复用一个 context。

## 调用时序

1. 构建器实际加载 Tailwind CSS 入口并获得生成 CSS。
2. `await ctx.transformWxss(css)`；结果 CSS 在 `result.css`。
3. `await ctx.getRuntimeSet()` 获取同一候选集合。
4. `await ctx.transformWxml(template)`；直接返回字符串。
5. `await ctx.transformJs(js)`；读取 `code`、`map`、`error`、`linked`。
6. 通过 bundler asset、loader result、`emitFile`、compilation 或 Vinyl stream 写回。

如果模板/JS 先执行，先调用 `getRuntimeSet({ forceCollect: true })`。

## Watch 刷新

```ts
// 普通源码候选变化
await ctx.getRuntimeSet({ forceCollect: true })

// Tailwind 入口、@source、@config 或配置图变化
await ctx.getRuntimeSet({
  forceRefresh: true,
  clearCache: true,
})
```

刷新完成后再转换受影响模块。不要原地修改正在被并发转换读取的 `Set`。

## 返回值与错误

- `transformWxss()`：PostCSS Result，检查 `css`、`map`、`messages`、`warnings()`。
- `transformWxml()`：字符串。
- `transformJs()`：对象；解析失败时 `code` 保持原文，调用方必须检查 `error`。
- `linked`：跨模块分析结果，由调用方交回模块图，不能在后置阶段临时读取源码重建。

## class set 安全边界

- 集合来自 Tailwind 生成或验证结果。
- API、路由、资源路径、MIME、日志文本不得进入集合。
- `alwaysEscape` 只适合输入确定全部是 class 的专用步骤，不用于普通业务 JS。
- 精确冲突字符串使用 `weappTwIgnore` 或 `jsPreserveClass`，不要扩大扫描。

## Bundler 数据所有权

| 数据 | 获取阶段 |
| --- | --- |
| 源码内容 | `load`、`transform`、loader、明确扫描层 |
| 模块关系 | ModuleInfo/ModuleGraph、chunk metadata、loader dependency API |
| CSS asset | transform result、compilation asset、bundle asset、Vinyl file |
| HMR | `watchChange`、`handleHotUpdate`、watch graph |
| 写回 | loader result、`emitFile`、asset update、stream file |

不要硬编码 `src/pages` 推导关系，不要直接用 `fs` 修改输出目录。

## 增量依赖索引

watch 适配器需要维护“候选来源 -> runtime set -> 模板/JavaScript 消费者”的依赖索引。候选新增、删除或 Tailwind 配置变化时，先刷新 runtime set，再让所有依赖该集合的模板和 JavaScript 重新转换；不能只处理触发 watch 事件的那个文件。
