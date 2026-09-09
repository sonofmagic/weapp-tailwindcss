import { spawnSync } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import YAML from 'yaml'

const workflowPath = fileURLToPath(new URL('../.github/workflows/react-native-compatibility.yml', import.meta.url))

it('模拟器二进制检查必须在 action 安装工具链之后执行', async () => {
  const workflow = YAML.parse(await readFile(workflowPath, 'utf8'))
  const steps = workflow.jobs.android.steps
  const index = steps.findIndex((step: { uses?: string }) => step.uses?.startsWith('reactivecircus/android-emulator-runner@'))
  expect(index).toBeGreaterThan(0)
  for (const step of steps.slice(0, index)) {
    expect(step.run ?? '').not.toMatch(/emulator["']?\s+-accel-check/)
  }
  expect(steps[index].with['disable-linux-hw-accel']).toBe(false)
  expect(steps[index].with['pre-emulator-launch-script']).toContain('-accel-check')
})

it.skipIf(process.platform === 'win32')('启动钩子使用已安装的 SDK 路径，并如实传播加速检查失败', async () => {
  const workflow = YAML.parse(await readFile(workflowPath, 'utf8'))
  const step = workflow.jobs.android.steps.find((step: { uses?: string }) => step.uses?.startsWith('reactivecircus/android-emulator-runner@'))
  const script = step.with['pre-emulator-launch-script']
  const root = await mkdtemp(path.join(tmpdir(), 'SDK 中文 & space-'))
  try {
    const executable = path.join(root, 'emulator', 'emulator')
    await mkdir(path.dirname(executable))
    await writeFile(executable, '#!/bin/sh\n[ "$1" = "-accel-check" ] || exit 8\nexit "$ACCEL_EXIT"\n')
    await chmod(executable, 0o755)
    for (const code of [0, 7]) {
      const result = spawnSync('sh', ['-c', script], {
        env: { ...process.env, ANDROID_HOME: root, ACCEL_EXIT: String(code) },
        encoding: 'utf8',
        timeout: 5000,
      })
      expect(result.stderr).toBe('')
      expect(result.status).toBe(code)
    }
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
