---
sidebar: aiSidebar
title: AI 沙箱（Sandbox）
---

# AI 沙箱（AI Sandbox）

## 概述

**AI 沙箱** 是一个**隔离的执行环境**，用于安全地运行 AI 生成的代码、执行命令或进行实验。沙箱确保 AI 操作不会影响宿主系统，同时提供可控的测试环境。

> **核心价值**：安全性 + 可控性 + 可重复性

---

## 为什么需要 AI 沙箱

### 1. 安全风险

没有沙箱的情况下，AI 可能：

- 删除重要文件
- 执行恶意命令
- 访问敏感数据
- 消耗系统资源
- 感染网络环境

### 2. 典型场景

| 场景 | 风险 | 沙箱解决方案 |
| ---- | ---- | ----------- |
| AI 生成代码执行 | 代码可能包含恶意逻辑 | 在容器中执行 |
| AI 调用系统命令 | 命令可能破坏系统 | 限制可用命令 |
| AI 访问网络 | 可能访问恶意网站 | 网络隔离/代理 |
| AI 修改文件 | 可能删除重要文件 | 文件系统隔离 |

---

## 沙箱的类型

### 1. 进程级沙箱

隔离单个进程：

```
┌─────────────────────────────────────────────────────────┐
│                    进程沙箱                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   宿主系统    │         │  沙箱进程    │             │
│  │              │         │              │             │
│  │  ┌────────┐  │  ──▶    │  ┌────────┐  │             │
│  │  │ 其他   │  │         │  │ AI 代码 │  │             │
│  │  │ 进程   │  │         │  │ 执行   │  │             │
│  │  └────────┘  │         │  └────────┘  │             │
│  │              │         │              │             │
│  └──────────────┘         └──────────────┘             │
│         ▲                         ▲                     │
│         └─────────────────────────┘                     │
│              权限隔离（chroot, namespace）              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**技术**：
- Linux: chroot, namespace, seccomp
- macOS: sandbox_exec
- Windows: Job Objects, Restricted Tokens

### 2. 容器级沙箱

使用容器技术隔离：

```
┌─────────────────────────────────────────────────────────┐
│                    容器沙箱                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │              宿主系统                        │        │
│  │  ┌─────────────────────────────────────┐   │        │
│  │  │          Docker/Podman 容器         │   │        │
│  │  │  ┌─────────────────────────────┐    │   │        │
│  │  │  │       AI 执行环境           │    │   │        │
│  │  │  │  - 独立文件系统             │    │   │        │
│  │  │  │  - 独立网络栈               │    │   │        │
│  │  │  │  - 资源限制                 │    │   │        │
│  │  │  └─────────────────────────────┘    │   │        │
│  │  └─────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**技术**：
- Docker
- Podman
- Kubernetes (Pod)
- gVisor (用户空间内核)

### 3. 虚拟机级沙箱

完整的虚拟化隔离：

```
┌─────────────────────────────────────────────────────────┐
│                    虚拟机沙箱                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │              宿主操作系统                    │        │
│  │  ┌─────────────────────────────────────┐   │        │
│  │  │         Hypervisor (KVM/VMware)      │   │        │
│  │  │  ┌─────────────────────────────┐    │   │        │
│  │  │  │      虚拟机操作系统           │    │   │        │
│  │  │  │  ┌─────────────────────┐     │    │   │        │
│  │  │  │  │   AI 执行环境       │     │    │   │        │
│  │  │  │  │  - 完整隔离         │     │    │   │        │
│  │  │  │  │  - 独立内核         │     │    │   │        │
│  │  │  │  │  - 硬件虚拟化       │     │    │   │        │
│  │  │  │  └─────────────────────┘     │    │   │        │
│  │  │  └─────────────────────────────┘    │   │        │
│  │  └─────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**技术**：
- KVM / QEMU
- VMware
- VirtualBox
- Firecracker (微虚拟机)

### 4. Web 沙箱

在浏览器/服务器端执行 JavaScript：

```
┌─────────────────────────────────────────────────────────┐
│                    Web 沙箱                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │              浏览器/服务器                   │        │
│  │  ┌─────────────────────────────────────┐   │        │
│  │  │         iframe / Web Worker         │   │        │
│  │  │  ┌─────────────────────────────┐    │   │        │
│  │  │  │     AI 生成的 JavaScript     │    │   │        │
│  │  │  │  - SOP 限制                 │    │   │        │
│  │  │  │  - CSP 策略                 │    │   │        │
│  │  │  │  - 内存隔离                 │    │   │        │
│  │  │  └─────────────────────────────┘    │   │        │
│  │  └─────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**技术**：
- iframe + sandbox 属性
- Web Workers
- Service Workers
- QuickJS (嵌入式 JS 引擎)

---

## 主流 AI 沙箱方案

### 1. E2B

专为 AI 代码执行设计的沙箱：

```bash
# 安装 E2B
pip install e2b

# 使用示例
from e2b import Sandbox

sandbox = Sandbox()
result = sandbox.run_code("print('Hello from AI!')")
```

**特点**：
- 专为 LLM 设计
- 预装常用工具
- 支持多种编程语言
- API 简单易用

### 2. Docker Exec

直接使用 Docker 作为沙箱：

```bash
# 运行容器执行代码
docker run --rm -v $(pwd):/workspace python:3.12 \
  python /workspace/script.py

# 限制资源
docker run --rm \
  --memory="512m" \
  --cpus="1.0" \
  --network=none \
  python:3.12 python script.py
```

### 3. Firecracker

AWS Lambda 使用的微虚拟机：

```json
{
  "boot_source": {
    "kernel_image_path": "vmlinux.bin"
  },
  "drives": [
    {
      "drive_id": "rootfs",
      "path_on_host": "rootfs.ext4",
      "is_root_device": true,
      "is_read_only": false
    }
  ],
  "machine_config": {
    "vcpu_count": 1,
    "mem_size_mib": 512
  }
}
```

### 4. WebAssembly (WASM)

在浏览器中安全执行：

```javascript
// QuickJS WASM 沙箱
import { getQuickJS } from 'quickjs-emscripten';

const { evalCode } = await getQuickJS();

// 在隔离环境中执行代码
const result = evalCode(`
  const sum = (a, b) => a + b;
  sum(1, 2);
`);
```

---

## AI 工具中的沙箱使用

### Claude Code CLI

Claude Code 使用系统级沙箱：

```typescript
// 安全执行命令
const result = await Bash({
  command: "npm test",
  options: {
    timeout: 30000,
    cwd: workspaceDir,
    env: { ...process.env, NODE_ENV: 'test' }
  }
});
```

**安全措施**：
- 命令超时限制
- 工作目录限制
- 环境变量过滤
- 文件访问权限控制

### Cursor IDE

Cursor 使用容器执行代码：

- 每个 Tab 在独立环境中运行
- 文件系统访问需用户授权
- 网络请求可配置

### GitHub Codespaces

完整的云开发环境作为沙箱：

```
用户代码 → Codespaces 容器 → 隔离执行环境
                      ↓
                  资源限制
                      ↓
                  网络隔离
```

---

## 构建自己的 AI 沙箱

### 基础方案：Python subprocess

```python
import subprocess
import tempfile
import os

def execute_in_sandbox(code: str, timeout: int = 30):
    """在临时目录中执行代码"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # 写入代码文件
        code_file = os.path.join(tmpdir, 'script.py')
        with open(code_file, 'w') as f:
            f.write(code)

        # 执行代码（带超时）
        result = subprocess.run(
            ['python', code_file],
            cwd=tmpdir,
            timeout=timeout,
            capture_output=True,
            text=True
        )

        return result.stdout, result.stderr, result.returncode
```

### 中级方案：Docker

```python
import docker

def execute_in_docker(code: str, language: str = 'python'):
    """在 Docker 容器中执行代码"""
    client = docker.from_env()

    # 运行容器
    container = client.containers.run(
        f'{language}:3.12-slim',
        command=['python', '-c', code],
        mem_limit='512m',
        cpu_quota=100000,
        network_disabled=True,
        detach=True
    )

    # 等待执行完成
    result = container.wait()
    logs = container.logs()

    # 清理
    container.remove()

    return logs.decode('utf-8')
```

### 高级方案：gVisor

```bash
# 使用 gVisor 运行容器
docker run --runtime=runsc --rm python:3.12 python -c "print('Hello')"
```

---

## 沙箱的最佳实践

### 1. 资源限制

| 资源 | 建议限制 | 原因 |
| ---- | -------- | ---- |
| CPU | 1-2 核心 | 防止 CPU 占用 |
| 内存 | 512MB-2GB | 防止内存耗尽 |
| 磁盘 | 1GB | 限制存储使用 |
| 网络 | 禁用或代理 | 防止恶意访问 |
| 时间 | 30-60秒 | 防止无限循环 |

### 2. 文件系统隔离

- 使用临时文件系统
- 禁止访问宿主目录
- 提供虚拟文件系统

### 3. 网络隔离

- 默认禁用网络
- 需要时使用白名单
- 记录所有网络请求

### 4. 日志和监控

- 记录所有操作
- 监控资源使用
- 异常行为告警

### 5. 清理机制

- 执行后自动清理
- 定时清理残留
- 资源回收

---

## 沙箱方案对比

| 方案 | 隔离级别 | 性能 | 复杂度 | 适用场景 |
| ---- | -------- | ---- | ------ | -------- |
| **进程级** | 低 | 高 | 低 | 简单脚本 |
| **容器** | 中 | 高 | 中 | 通用场景 |
| **虚拟机** | 高 | 中 | 高 | 高安全要求 |
| **Web WASM** | 中 | 中 | 低 | 浏览器环境 |
| **E2B** | 中 | 高 | 低 | 快速集成 |

---

## 参考资源

### 开源项目

- [E2B](https://github.com/e2b-dev/e2b) - AI 代码执行沙箱
- [gVisor](https://github.com/google/gvisor) - 用户空间内核
- [Firecracker](https://github.com/firecracker-microvm/firecracker) - 微虚拟机
- [QuickJS](https://github.com/quickjs-ng/quickjs) - 轻量级 JS 引擎

### 文档

- [Docker 安全](https://docs.docker.com/engine/security/)
- [Linux Namespace](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- [seccomp](https://man7.org/linux/man-pages/man2/seccomp.2.html)

---

**文档更新时间：2025 年 12 月**
