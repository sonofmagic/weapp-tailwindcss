# 成片交付与验证记录

验证日期：2026-10-02。工程位于独立分支 `codex/brand-promo-video`，不修改原有 Lynx 宣传片。

## 成片结果

| 项目 | 横版 | 竖版 |
| --- | --- | --- |
| 画面 | 1920×1080 | 1080×1920 |
| 视频时长 / 帧数 | 60 秒 / 1800 帧 | 30 秒 / 900 帧 |
| 文件时长（包含 AAC 尾部填充） | 60.053333 秒 | 30.058667 秒 |
| 综合响度 | −16.09 LUFS | −16.01 LUFS |
| 真峰值 | −1.49 dBTP | −2.86 dBTP |
| 字幕段数 | 22 | 14 |
| MP4 文件大小 | 14,563,823 字节 | 7,866,387 字节 |

两支成片均为 H.264、30 FPS、yuv420p、BT.709、AAC 48 kHz 立体声，包含 faststart。完整解码无错误，自动检测未发现黑场。两张封面尺寸、字幕文件与词级时间戳一致性均通过检查。片尾二维码均解析为 `https://tw.weapp.dev`。

## 实际执行的检查

以下命令在仓库根目录执行；本轮工作树复用已安装依赖，因此使用进程级环境变量关闭 pnpm 12 的运行前自动重装。

```bash
rtk proxy env CI=1 PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false pnpm --filter @weapp-tailwindcss/promo-video verify
rtk proxy env PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false pnpm exec eslint apps/weapp-tailwindcss-promo-video/src apps/weapp-tailwindcss-promo-video/scripts apps/weapp-tailwindcss-promo-video/vitest.config.ts --ext .ts,.tsx --ignore-pattern '**/*.css' --ignore-pattern '**/*.json'
rtk proxy git diff --check
rtk proxy env PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false pnpm agents:check
```

- 定向测试：2 个测试文件、7 项测试通过，覆盖时间轴与字幕对齐。旁白时长和素材完整性由媒体制作与验证脚本检查。
- TypeScript 与定向 ESLint：通过。
- 仓库规则检查：53 份规则、95 份文档、493 个命令条目，0 个错误。
- 媒体参数与响度实测结果保存在 `out/verification.json`。

## 视觉检查范围

检查了两种画幅的开场、代码构图、样式管线、跨端设备、生态、转场边界和片尾关键帧，并从最终编码视频重新抽帧复核。修正了设备与标签遮挡、场景淡入淡出叠字和音频压低的突变；字幕取自与旁白同一语音流的实际词边界。渲染后台浏览器已在流程结束时释放。

本记录的证据是关键帧人工检查、独立复核、完整视频解码、实际语音时间戳和音频测量，不表示已对整片逐秒人工观看或主观试听。公开发布前建议在目标设备上完整播放，确认声音与平台遮挡效果。

## 交付文件

`out/weapp-tailwindcss-media-kit.zip` 包含两支 MP4、两张 PNG 封面、四份 SRT/VTT 字幕、本验证记录和机器验证报告。MP4 已内嵌字幕；平台额外导入 SRT/VTT 时应避免重复显示。

可编辑源码、字体及字体许可证在本工程目录，渲染与修改方法见 `README.md`。`public/audio/` 为本地准备好的声音素材，离线重渲时需保留。成片和声音素材未纳入 Git；请保留本工作树或另行备份。
