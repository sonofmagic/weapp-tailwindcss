---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1172
baseline: 7b50dcb582174221fc2f85ae0e9132e0a4c16316
regressions:
  - e2e/react-native-android-window.test.ts
---

# Android CI 的 KVM 访问前置条件

## 症状

Expo Android 11/API 30 自动检查 34304902514 的任务 102319452874 在调用 uiautomator dump 时退出 133。APK 已构建，应用已显示，但不能视为验收通过。

## 根因与纠正

工作流日志明确报告当前用户没有 /dev/kvm 权限，自动将硬件加速关闭，使用 `-accel off` 启动。模拟器警告 x86_64 软件仿真可能无法工作，TCG 不支持 AVX/F16C；启动耗时 356 秒。logcat 中 Android ART 的 BootImageLoader::LoadImage 在 app_process 启动阶段触发 SIGTRAP，尚未进入 uiautomator 业务逻辑。

CI 现在只给当前临时 runner 用户增加 KVM 读写 ACL，在启动前执行权限检查和 emulator -accel-check，并禁止 action 静默退回软件仿真。原有 UI、运行时、截图与样式断言保持不变，没有添加重试。日志能证明旧运行缺少 KVM 前置条件；具体 ART 指令故障与软件仿真的因果仍需后续真实 CI 证据，不据此修改产品代码。

## 验证

actionlint 校验工作流；Linux hosted runner 的实际加速和现有 Android 验收由新提交自动检查验证。本机为 macOS，未执行 /dev/kvm 配置，不以本机命令冒充 Linux 结果。原失败 logcat、截图、UI XML、Metro 和构建日志保留在原工作流 artifact。

## 适用边界

仅修复既有 Expo CI 的 Linux 模拟器前置条件，不扩展 HBuilderX 验收到 Android，也不代表 HBuilderX CLI 挂起已解决。

## 规则评估

不新增 AGENTS；使用前置条件校验和真实失败取证要求。
