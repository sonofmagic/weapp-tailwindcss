---
"@weapp-tailwindcss/hbuilderx-runner": patch
---

修复 Windows 原生进程参数被 shell 拆分的问题，正确处理带空格和中文的路径、cmd shim 以及可执行文件缺失错误。

使用 Windows 内置 PowerShell 与进程 API 探测已有 HBuilderX 实例，避免 WMIC 缺失时误判为未启动并重复打开 IDE。通过 JSON 保留中文、逗号和共享路径，探测失败时明确报错。

显式配置 CLI 时直接通过 listhost 与版本握手绑定实例，不再依赖操作系统进程枚举。只有确认没有 host 才启动一次 IDE；版本不匹配、歧义与命令超时保留为错误，连接过程共享启动截止时间。

只解析已配置 CLI 路径时不再枚举系统进程；需要运行状态的信息查询 API 保留原有语义。
