# Weapp-tailwindcss Website

docusaurus + tailwindcss

## 启动项目

```bash
# 安装依赖
pnpm install

# 启动项目
pnpm dev
```

## Playwright 截图测试

Playwright 用来对官网的所有路由做截图回归，现在同时覆盖桌面视口与移动端（Chromium 模拟 iPhone 12）。默认会访问生产站点 `https://tw.icebreaker.top/`，也可以通过 `PLAYWRIGHT_BASE_URL` 指定自己的预览地址（例如 `http://192.168.10.4:4000/`）来验证局域网环境。

```bash
# 在仓库根目录执行
pnpm --filter @weapp-tailwindcss/website e2e

# 指定移动端验证地址（如 192.168.10.4:4000）
PLAYWRIGHT_BASE_URL=http://192.168.10.4:4000 pnpm --filter @weapp-tailwindcss/website e2e
```

## 报错解决

Module not found: Error: Can't resolve '@weapp-tailwindcss/merge' in '/Users/zzy/Projects/weapp-tailwindcss/website/src/theme/ReactLiveScope'

```bash
# 本地编译，cd 到根目录下

pnpm build

```

<https://tw.icebreaker.top/>

## Showcase 数据同步

`docs/showcase` 页面由 `scripts/update-showcase.ts` 生成，会从 [issue #270](https://github.com/sonofmagic/weapp-tailwindcss/issues/270) 采集最新的文本与截图/二维码。脚本会把 **所有** 附件下载到 `website/static/img/showcase/<序号.小程序名称>/` 下：页面默认把第一张图片（按评论中的顺序，约定为二维码/小程序码）直接展示，其余图片全部收起，需要点击「展开查看其余 N 张图片」后才会看到，可通过配置文件手动筛选或隐藏。只有填写了「小程序名称」字段的评论才会被收录，其余会在脚本执行时输出警告。

```bash
# 在仓库根目录执行
pnpm showcase:update
```

> 建议在运行前导出 `GITHUB_TOKEN`（或 `GH_TOKEN`）以提升 GitHub API 额度。脚本会清空 `website/static/img/showcase` 后重新下载所有图片，因此请勿在该目录放置其他静态资源。你也可以在 CI/cron 中周期性执行上面的命令，让官网自动获得最新的展示内容。

可选环境变量：

- `SHOWCASE_SKIP_IMAGES=1`：仅更新文案，跳过图片下载（比如在无外网的环境调试）。
- `SHOWCASE_IMAGE_TIMEOUT=20000`：单张图片的超时时间，单位 ms。
- `SHOWCASE_IMAGE_RETRY=3`：下载失败时的重复次数。
- `SHOWCASE_REPO`、`SHOWCASE_ISSUE`：若需要同步其他仓库/Issue，可覆盖默认值 `sonofmagic/weapp-tailwindcss` 与 `270`。
- `SHOWCASE_PROXY`：需要走代理抓取 GitHub API/图片时设置，例如 `SHOWCASE_PROXY=http://127.0.0.1:7890`。若未设置则会自动默认 `http://127.0.0.1:7890`，再依次尝试读取 `HTTPS_PROXY` / `HTTP_PROXY`。

### 手动控制展示的作品 & 图片

运行脚本后，可编辑 `website/docs/showcase/config.json` 来手动隐藏作品或指定要展示的图片：

```json
{
  "entries": {
    "009.qubaibai": {
      "hidden": false,
      "images": [
        "qrcode.jpg", // 也可以填 `/img/showcase/009.qubaibai/qrcode.jpg`
        "https://example.com/..." // 或者直接使用原始的远程 URL
      ]
    },
    "010.example": {
      "hidden": true
    }
  }
}
```

- `hidden: true` 会直接跳过该作品。
- `images` 用来精确指定要展示的图片，支持填写下载后的文件名、`/img/...` 路径或原始远程 URL；如果不设置就会展示该作品的全部附件。

脚本默认展示所有图片，并以「链接」字段的文本作为卡片标题（若未填写则回退到评论中的名称）。配置文件可以满足“由我来决定哪些小程序和图片被隐藏”的需求。
