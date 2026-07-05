import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { HBuilderXIssue } from './types'

const PROJECT_NOT_UNI_APP_RE = /不是\s*uni-app\s*项目|not\s+a\s+uni-app\s+project/i
const PROJECT_TYPE_UNSUPPORTED_RE = /项目类型为(.+?)，暂不支持|project\s+type.+unsupported/i
const CONFIG_LOAD_FAILED_RE = /failed to load config|error when starting dev server|Failed to resolve entry for package/i
const CLI_NOT_FOUND_RE = /未找到\s*HBuilderX\s*CLI|HBUILDERX_CLI_PATH|command not found|ENOENT/i
const ANDROID_TOOLCHAIN_MISSING_RE = /adb(?:\.exe)?(?:\s*[:：].*)?(?:not found|ENOENT|不是内部或外部命令)|Android SDK|platform-tools/i
const IOS_TOOLCHAIN_MISSING_RE = /xcrun|xcode-select|xcodebuild|simctl|DEVELOPER_DIR|iOS 模拟器|Xcode/i
const HARMONY_TOOLCHAIN_MISSING_RE = /(?:^|\s)hdc[\s:：]|Harmony|DevEco|OpenHarmony/i

export function createLogBuffer(maxChunks = 160) {
  const logs: string[] = []
  return {
    logs,
    push(chunk: Buffer | string) {
      logs.push(chunk.toString())
      if (logs.length > maxChunks) {
        logs.splice(0, logs.length - maxChunks)
      }
    },
    text() {
      return logs.join('')
    },
  }
}

export function collectProcessOutput(child: ChildProcess, maxChunks = 160) {
  const buffer = createLogBuffer(maxChunks)
  child.stdout?.on('data', chunk => buffer.push(chunk))
  child.stderr?.on('data', chunk => buffer.push(chunk))
  return buffer.logs
}

export function classifyHBuilderXOutput(output: string): HBuilderXIssue {
  if (ANDROID_TOOLCHAIN_MISSING_RE.test(output)) {
    return {
      kind: 'android-toolchain-missing',
      message: '当前环境缺少 Android 运行所需工具链。',
      hint: '请安装 Android SDK platform-tools，并确认 adb 可用；需要指定设备时设置 E2E_HBUILDERX_ANDROID_DEVICE_ID。',
    }
  }
  if (IOS_TOOLCHAIN_MISSING_RE.test(output)) {
    return {
      kind: 'ios-toolchain-missing',
      message: '当前环境缺少 iOS 模拟器或 Xcode 工具链。',
      hint: '请安装完整 Xcode，确认 xcrun simctl/xcodebuild 可用，并完成 Xcode 首次启动组件安装。',
    }
  }
  if (HARMONY_TOOLCHAIN_MISSING_RE.test(output)) {
    return {
      kind: 'harmony-toolchain-missing',
      message: '当前环境缺少 Harmony 运行所需工具链。',
      hint: '请安装 DevEco Studio，或设置 HDC_PATH/E2E_HBUILDERX_HARMONY_HDC_PATH 指向 hdc。',
    }
  }
  if (CLI_NOT_FOUND_RE.test(output)) {
    return {
      kind: 'cli-not-found',
      message: '未找到 HBuilderX CLI。',
      hint: '请启动/安装 HBuilderX，或设置 HBUILDERX_CLI_PATH 指向 HBuilderX CLI。',
    }
  }
  if (PROJECT_NOT_UNI_APP_RE.test(output)) {
    return {
      kind: 'project-not-uni-app',
      message: 'HBuilderX 将当前目录识别为非 uni-app 项目。',
      hint: '请确认传入的是 HBuilderX 可识别的项目根目录，并检查 manifest.json、pages.json 与导入状态。',
    }
  }
  const unsupported = output.match(PROJECT_TYPE_UNSUPPORTED_RE)
  if (unsupported) {
    return {
      kind: 'project-type-unsupported',
      message: `HBuilderX 不支持当前项目类型${unsupported[1] ? `：${unsupported[1].trim()}` : ''}。`,
      hint: '请确认项目已按目标平台导入，必要时先 close/open 项目后再 launch。',
    }
  }
  if (CONFIG_LOAD_FAILED_RE.test(output)) {
    return {
      kind: 'config-load-failed',
      message: 'HBuilderX/Vite 配置加载失败。',
      hint: '请先构建 workspace 依赖并检查 vite.config.ts 中的包入口。输出日志里通常包含具体 import。',
    }
  }
  return {
    kind: 'unknown',
    message: 'HBuilderX 命令失败，未匹配到已知分类。',
  }
}

export function createTimeoutIssue(): HBuilderXIssue {
  return {
    kind: 'timeout',
    message: 'HBuilderX 命令在限定时间内没有结束。',
    hint: '请检查 HBuilderX 是否卡在项目导入、设备选择、运行基座安装或平台编译阶段；最近日志通常包含停住的位置。',
  }
}

export function formatRecentLogs(logs: string[], maxLength = 6000) {
  const output = logs.join('')
  return output.length > maxLength ? output.slice(-maxLength) : output
}
