import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { films, FORMATS, getFormat } from '../src/config'
import { appRoot, audioDir } from './paths'

const formats = process.argv[2] ? [getFormat(process.argv[2])] : FORMATS
for (const format of formats) {
  const directory = path.join(audioDir, format, 'voice')
  await fs.mkdir(directory, { recursive: true })
  const manifest = []
  for (const scene of films[format].scenes) {
    const file = path.join(directory, `${scene.id}.mp3`)
    const text = scene.spoken ?? scene.narration
    const signature = `${text}|zh-CN-XiaoxiaoNeural|+8%|edge-tts-7.2.8|word-boundaries-v1`
    const stamp = path.join(directory, `${scene.id}.txt`)
    const cached = await fs.readFile(stamp, 'utf8').catch(() => '')
    if (cached !== signature || !(await fs.stat(file).catch(() => null))) {
      await execa('uvx', ['--from', 'edge-tts==7.2.8', 'python', path.join(appRoot, 'scripts', 'audio', 'tts.py'), text, file], { stdio: 'inherit' })
      await fs.writeFile(stamp, signature)
    }
    const probe = await execa('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file])
    const duration = Number(probe.stdout.trim())
    const maximum = scene.duration - scene.offset - 0.18
    if (!Number.isFinite(duration) || duration <= 0 || duration > maximum) {
      throw new Error(`${format}/${scene.id} 配音 ${duration.toFixed(2)}s 超出镜头余量 ${maximum.toFixed(2)}s，请调整文案。`)
    }
    const words = JSON.parse(await fs.readFile(path.join(directory, `${scene.id}.words.json`), 'utf8'))
    manifest.push({ id: scene.id, duration, start: scene.from + scene.offset, text: scene.narration, words })
    console.log(`${format}/${scene.id}: ${duration.toFixed(2)}s / ${maximum.toFixed(2)}s`)
  }
  await fs.writeFile(path.join(audioDir, format, 'voice.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}
