# LLM 友好文档 (llms.txt)

## 生成方式

1. 在仓库根目录执行 `pnpm --filter @weapp-tailwindcss/website build`（或 `cd website && pnpm build`）。
2. 构建后，`website/build/` 会生成：
   - `llms.txt`（索引）
   - `llms-full.txt`（完整内容）
   - `llms-quickstart.txt`（上手/AI 工作流）
   - `llms-api.txt`（配置、API、迁移与问题）
   - 去除 MDX import 的纯 Markdown 文件，方便直接喂给模型。

## 线上地址

- `https://tw.icebreaker.top/llms.txt`
- `https://tw.icebreaker.top/llms-full.txt`
- `https://tw.icebreaker.top/llms-quickstart.txt`
- `https://tw.icebreaker.top/llms-api.txt`

> 如果通过 GitHub Pages 访问，请注意前缀路径 `/weapp-tailwindcss/`。

## 给 AI 的示例提示词

> 你可以从 https://tw.icebreaker.top/llms-quickstart.txt 和 https://tw.icebreaker.top/llms-api.txt 读取 weapp-tailwindcss 的入门与配置说明，回答时请引用相关链接。

## 离线使用

- 下载 `llms-full.txt` 直接给模型。
- 或将生成阶段的 Markdown 文件整体打包后供模型上下文检索。
