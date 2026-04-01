# uni-app-x-hbuilderx

`uni-app x + HBuilderX + weapp-tailwindcss` 模板。

## 适用场景

- 使用 `uni-app x`
- 主要在 `HBuilderX` 中开发和运行
- 想快速验证 `uvue / uts` 场景下的样式转换

## 技术栈

- `uni-app x`
- `weapp-tailwindcss`
- `pnpm`

## 使用前提

- Node.js `20.19+`
- `pnpm`
- `HBuilderX`

## 快速开始

```bash
pnpm install
```

安装完成后，将项目导入 `HBuilderX` 运行。

如果希望直接通过命令行启动模拟器，请先满足以下任一条件：

- 已启动 `HBuilderX`
- 已设置 `HBUILDERX_CLI_PATH`，例如 `export HBUILDERX_CLI_PATH="/Applications/HBuilderX.app/Contents/MacOS/cli"`

启动模拟器：

```bash
pnpm start:android:emulator
pnpm start:ios:simulator
```

默认会启动检测到的第一个 Android AVD；如果你本机有多个 AVD，可指定：

```bash
ANDROID_AVD_NAME="Medium_Phone_API_36" pnpm start:android:emulator
```

把应用运行到已启动的模拟器：

```bash
pnpm dev:android:emulator
pnpm dev:ios:simulator
```

## 模板说明

- 安装依赖后会自动执行 `weapp-tw patch`
- 模板默认覆盖 `pages`、`components` 等常见目录
- 如果你新增了 `uts` / `uvue` 目录结构，记得同步调整 `tailwind` 提取范围

## 相关文档

- `weapp-tailwindcss`：<https://tw.icebreaker.top/>
- `uni-app x`：<https://doc.dcloud.net.cn/uni-app-x/>
