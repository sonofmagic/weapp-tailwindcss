import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { outputDir, publicDir } from './paths'

interface ProbeResult {
  streams: Array<{ codec_type: string, codec_name: string, width?: number, height?: number, pix_fmt?: string, sample_rate?: string, avg_frame_rate?: string }>
  format: { duration: string }
}

async function probe(file: string) {
  const result = await execa('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file])
  return JSON.parse(result.stdout) as ProbeResult
}

async function main() {
  const captures = ['ios.mp4', 'android.mp4']
  for (const capture of captures) {
    const file = path.join(publicDir, 'captures', capture)
    const stat = await fs.stat(file)
    if (stat.size >= 10 * 1024 * 1024) {
      throw new Error(`${capture} must remain below 10 MB.`)
    }
    const metadata = await probe(file)
    const video = metadata.streams.find(stream => stream.codec_type === 'video')
    if (!video || video.codec_name !== 'h264' || video.avg_frame_rate !== '30/1') {
      throw new Error(`${capture} must be H.264 at 30 FPS.`)
    }
  }

  const finalPath = path.join(outputDir, 'lynx-promo-zh-1080p.mp4')
  const final = await probe(finalPath)
  const video = final.streams.find(stream => stream.codec_type === 'video')
  const audio = final.streams.find(stream => stream.codec_type === 'audio')
  const duration = Number(final.format.duration)
  if (!video || video.codec_name !== 'h264' || video.width !== 1920 || video.height !== 1080 || video.pix_fmt !== 'yuv420p' || video.avg_frame_rate !== '30/1') {
    throw new Error('Final video does not match the required 1080p H.264 output.')
  }
  if (!audio || audio.codec_name !== 'aac' || audio.sample_rate !== '48000') {
    throw new Error('Final audio must be AAC at 48 kHz.')
  }
  if (Math.abs(duration - 60) > 0.1) {
    throw new Error(`Final duration must be 60 seconds, received ${duration}.`)
  }
  process.stdout.write(`${JSON.stringify({ finalPath, duration, video, audio }, null, 2)}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
