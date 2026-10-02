# weapp-tailwindcss 品牌宣传片

面向前端开发者的中文品牌片：横版 60 秒、竖版 30 秒，各自剪辑、构图、配音和混音。主题为「Tailwind CSS，走向全端」，官网入口为 https://tw.weapp.dev。

## 成片

输出统一放在本工程 `out/`：

| 文件 | 规格 |
| --- | --- |
| `weapp-tailwindcss-landscape.mp4` | 1920×1080，60 秒，1800 帧 |
| `weapp-tailwindcss-portrait.mp4` | 1080×1920，30 秒，900 帧 |
| `weapp-tailwindcss-landscape-cover.png` | 横版封面 |
| `weapp-tailwindcss-portrait-cover.png` | 竖版封面 |
| `weapp-tailwindcss-{landscape,portrait}.{srt,vtt}` | 按实际配音词边界对齐的字幕 |
| `verification.json` | 完整解码、媒体参数、响度和字幕校验 |

MP4 使用 H.264、30 FPS、yuv420p、AAC 48 kHz 立体声和 faststart。混音目标 −16 LUFS；无声浏览时，画面文案与内嵌字幕仍保留完整叙事。

## 环境与准备

遵循仓库 Node.js / pnpm 版本要求；本机还需 `ffmpeg`、`ffprobe`、`uvx`，均从 PATH 读取。配音使用 `edge-tts==7.2.8` 的 `zh-CN-XiaoxiaoNeural`，语速 `+8%`。首次准备字体与配音需要网络，之后渲染只读取本地素材。

在仓库根目录安装依赖后执行：

```bash
pnpm --filter @weapp-tailwindcss/promo-video prepare:media
pnpm --filter @weapp-tailwindcss/promo-video render:frames
pnpm --filter @weapp-tailwindcss/promo-video render
pnpm --filter @weapp-tailwindcss/promo-video verify
```

Remotion 会管理其 Headless Shell。已有兼容 Chromium 时可通过 `REMOTION_BROWSER_EXECUTABLE` 指定可执行文件的绝对路径；不在源码中写入本机路径。`REMOTION_CONCURRENCY` 控制并发，默认 4。渲染脚本复用一个后台浏览器，并在成功或异常时关闭它。

本次隔离工作区复用本机已安装依赖。若以同样方式开发，进程级设置 `PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false` 可防止 pnpm 12 在执行脚本前自动重装；常规 `pnpm install --frozen-lockfile` 安装的 checkout 不需要此设置。

## 编辑与预览

```bash
pnpm --filter @weapp-tailwindcss/promo-video studio
pnpm --filter @weapp-tailwindcss/promo-video render:covers
pnpm --filter @weapp-tailwindcss/promo-video render:landscape
pnpm --filter @weapp-tailwindcss/promo-video render:portrait
```

Composition 为 `WeappPromoLandscape`、`WeappPromoPortrait`，封面分别追加 `Cover`。

- `src/config.ts` 定义两套时间轴、显示文案和发音文案。改文案后执行 `fonts`、`voice`、`audio`；改镜头时长还需执行 `music`。
- `src/scenes/` 编排镜头，`src/components/` 保存品牌光带、代码与自制设备界面。所有动效以帧数驱动。
- `scripts/audio/tts.py` 从同一语音流保存 MP3 与词级时间戳；字幕会校验规范化后的发音文本与显示文本一致，不按字符数猜测时间。
- `scripts/audio/synthesis.ts` 生成原创 120 BPM 配乐，包含和弦铺底、琶音、低音、节拍和转场音效。`audio` 完成平滑音乐压低与两遍响度归一。
- `render:frames` 输出镜头起点、中段、转场前和最后一帧，便于检查布局与过渡。

## 视觉与内容边界

采用正式蓝绿 Logo、深海蓝背景、银白文字、Noto Sans SC 与 JetBrains Mono。字库按新文案生成，许可证随字体保存在 `src/assets/fonts/`。

片中 FLOW 为专门制作的界面设计示意。展示的平台包括 Web/H5、小程序、App WebView、uni-app x、React Native、Lynx；它们的样式能力以对应运行时和仓库文档为准。宣传动画不作为本轮设备实测证据。

品牌图形来自仓库 `assets/logo.svg`，框架标识来自官网素材目录，用于指认其对应技术生态。项目未使用第三方商业产品截图或外部音乐录音；配乐由本工程确定性合成脚本创作。

## 验证

```bash
pnpm --filter @weapp-tailwindcss/promo-video test
pnpm --filter @weapp-tailwindcss/promo-video typecheck
pnpm --filter @weapp-tailwindcss/promo-video verify
pnpm agents:check
```

只执行此视频工程的定向检查，不涉及产品构建行为或多端 E2E。`verify` 检查两种画幅的帧数、编码、完整解码、黑帧、faststart、响度、峰值、声道、封面和字幕。发布前仍需完整观看与试听两支成片，确认转场和音画观感。

`out/`、`.render/` 与 `public/audio/` 为本地生成产物。需要离线重渲时保留 `public/audio/`；重新获取声音会受语音服务版本变化影响。源码、字体及字幕纳入版本管理。
