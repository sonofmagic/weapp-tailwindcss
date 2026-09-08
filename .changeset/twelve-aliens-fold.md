---
"@weapp-tailwindcss/hbuilderx-runner": patch
---

修复 Windows 原生进程参数被 shell 拆分的问题，正确处理带空格和中文的路径、cmd shim 以及可执行文件缺失错误。

使用 Windows 内置 PowerShell 与进程 API 探测已有 HBuilderX 实例，避免 WMIC 缺失时误判为未启动并重复打开 IDE。通过 JSON 保留中文、逗号和共享路径，探测失败时明确报错。
