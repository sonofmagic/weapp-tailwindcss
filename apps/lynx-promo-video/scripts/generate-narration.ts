import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { scenes } from '../src/config'
import { publicDir } from './paths'

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)))
  })
}

async function main() {
  const outputDir = path.join(publicDir, 'audio', 'narration')
  await fs.mkdir(outputDir, { recursive: true })
  for (const [index, scene] of scenes.entries()) {
    const base = `${String(index + 1).padStart(2, '0')}-${scene.id}`
    await run('uvx', [
      '--from',
      'edge-tts',
      'edge-tts',
      '--voice',
      'zh-CN-XiaoxiaoNeural',
      '--rate=+8%',
      '--text',
      scene.subtitle,
      '--write-media',
      path.join(outputDir, `${base}.mp3`),
      '--write-subtitles',
      path.join(outputDir, `${base}.vtt`),
    ])
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
