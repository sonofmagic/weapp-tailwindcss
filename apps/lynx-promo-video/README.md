# `@weapp-tailwindcss/lynx` 宣传视频

60 秒 Remotion 技术宣传片，画面中的产品界面来自 `examples/react-lynx-promo` 在 iOS 与 Android Lynx host 中的真实录制。

## 生成素材

```bash
pnpm --filter @weapp-tailwindcss/lynx-promo-video fonts
pnpm --filter @weapp-tailwindcss/lynx-promo-video voice
pnpm --filter @weapp-tailwindcss/lynx-promo-video assets
```

`fonts` 从 Google Fonts 生成覆盖当前视频文案的 Noto Sans SC WOFF2 子集，并从固定版本的 Fontsource 包复制 JetBrains Mono；字体与两份 OFL 许可证都保存在 `src/assets/fonts/`。旁白使用 `edge-tts` 的 `zh-CN-XiaoxiaoNeural`，生成后的视频渲染不依赖网络。环境音由仓库内脚本生成，不使用第三方音乐。

## 预览与渲染

```bash
pnpm --filter @weapp-tailwindcss/lynx-promo-video capture
pnpm --filter @weapp-tailwindcss/lynx-promo-video studio
pnpm --filter @weapp-tailwindcss/lynx-promo-video render:frames
pnpm --filter @weapp-tailwindcss/lynx-promo-video render:cover
pnpm --filter @weapp-tailwindcss/lynx-promo-video render
pnpm --filter @weapp-tailwindcss/lynx-promo-video verify
```

`capture` 会在 `os.tmpdir()` 复制现有原生 fixture host，向临时 host 注入宣传 Demo bundle，并把处理后的 30 FPS H.264 录屏写入 `public/captures/`。兼容性报告模式仍使用原来的默认 bundle、报告等待和基线比较流程。

Android host 需要 Java 17 和 Gradle 8。若它们不在 PATH，可通过 `LYNX_JAVA_HOME` 与 `LYNX_GRADLE` 传入跨平台绝对路径；runner 不写死本机 JDK 或 Gradle 位置。

iOS 默认执行 XcodeGen 与 CocoaPods 安装。若 `pod` 不在 PATH，可通过 `LYNX_POD` 传入可执行文件的绝对路径。仅在 `LYNX_NATIVE_WORK_DIR` 已包含完整 Xcode project、`Pods` 和 workspace 时，才可显式传入 `LYNX_IOS_SKIP_PROJECT_GENERATION=1` 与 `LYNX_IOS_SKIP_POD_INSTALL=1` 复用已验收 host；缺少这些目录时 runner 会拒绝跳过对应步骤。

输出文件位于 `out/`，中文字幕同时保存在 `lynx-promo-zh.srt`。

本次素材验收环境：iOS Simulator 为 iPhone 17 Pro / iOS 26.5，Android Emulator 为 `sdk_gphone_arm64` / Android 11 API 30；两端应用内 Lynx Engine 均为 4.0.1。处理后的录屏统一为 720 像素宽、30 FPS、H.264、无音频，单文件小于 10 MB。

## 内容边界

视频只宣称 ReactLynx + Rspeedy + Tailwind CSS 4 的已验证集成能力。兼容性数量从 `examples/react-lynx/src/compatibility/baseline.json` 生成，不宣称 Lynx 支持全部 Tailwind CSS utility。

字体由 `@fontsource-variable/noto-sans-sc` 与 `@fontsource-variable/jetbrains-mono` 提供，均使用 SIL Open Font License。
