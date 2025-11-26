# wetw CLI 使用说明

一个借鉴 shadcn-ui 思路的生成器：通过配置文件 + 组件注册表，把模板文件直接拷贝到你的项目中，方便二次定制。配置文件默认使用 `wetw.config.ts`（c12 原生支持）。

## 安装

```bash
pnpm add -D wetw
```

或在未安装的情况下临时调用：

```bash
npx wetw --help
```

## 快速开始

1. 生成配置文件：

```bash
wetw init
```

会在当前目录写出 `wetw.config.ts`，默认输出目录是 `wetw/`。

2. 查看可用组件：

```bash
wetw list
```

3. 添加组件（示例内置了一个 `counter`）：

```bash
wetw add counter
```

生成的文件将落在配置的 `outDir` 下，例如 `wetw/counter/*`。如需覆盖已有文件，加上 `--force`。

## 配置示例

`wetw.config.ts`：

```ts
import { defineConfig } from 'wetw'

export default defineConfig({
  outDir: 'wetw', // 生成目录，默认为 wetw
  // registry 可以是本地/远程 JSON，或直接写数组
  // registry: 'https://example.com/wetw/registry.json',
  // templatesRoot: './templates', // 用于解析 registry 文件中的相对 src
})
```

## 命令速查

- `wetw init [--config wetw.config.ts]`：写入默认配置文件。
- `wetw list [--json]`：输出当前 registry 中的组件清单。
- `wetw add <name...> [--force]`：按名称生成组件文件。
- 通用参数：`--config` 指定配置文件，`--cwd` 指定工作目录。

## 自定义 registry

一个最小的注册表示例（保存为 `registry.json`）：

```json
[
  {
    "name": "button",
    "description": "自定义按钮",
    "files": [
      { "path": "button/index.ts", "content": "export const btn = true" }
    ]
  }
]
```

在 `wetw.config.ts` 中指定：

```ts
export default defineConfig({
  registry: './registry.json',
})
```

随后执行 `wetw add button` 即可写入对应文件。

### 使用官方线上 registry

项目内置的线上清单可直接复用：

```ts
export default defineConfig({
  registry: 'https://tw.icebreaker.top/wetw/registry.json',
})
```

当前包含 `counter`、`tag` 两个示例组件，对应源码由网站静态资源提供。
