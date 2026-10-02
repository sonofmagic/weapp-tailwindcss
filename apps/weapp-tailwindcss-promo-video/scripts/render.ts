import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { bundle } from '@remotion/bundler'
import { getCompositions, openBrowser, renderMedia, renderStill } from '@remotion/renderer'
import { execa } from 'execa'
import { films, FORMATS, FPS, getFormat } from '../src/config'
import { appRoot, outputDir, publicDir } from './paths'

const mode = process.argv[2] ?? 'all'
if (!['all', 'frames', 'covers', ...FORMATS].includes(mode)) {
  throw new Error(`未知渲染模式：${mode}`)
}
const formats = mode === 'landscape' || mode === 'portrait' ? [getFormat(mode)] : FORMATS
await fs.mkdir(outputDir, { recursive: true })
const serveUrl = await bundle({ entryPoint: path.join(appRoot, 'src', 'index.ts'), publicDir, outDir: path.join(appRoot, '.render'), webpackOverride: config => ({ ...config, resolve: { ...config.resolve, symlinks: false } }) })
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE
const browser = await openBrowser('chrome', { browserExecutable })
try {
  const compositions = await getCompositions(serveUrl, { puppeteerInstance: browser })
  for (const format of formats) {
    const film = films[format]
    const composition = compositions.find(item => item.id === film.id)
    const cover = compositions.find(item => item.id === `${film.id}Cover`)
    if (!composition || !cover) {
      throw new Error(`${format} Composition 缺失`)
    }
    if (mode === 'frames') {
      const frames = new Set([0, 30, film.seconds * FPS - 1])
      for (const scene of film.scenes) {
        frames.add(scene.from * FPS)
        frames.add((scene.from + Math.min(2.5, scene.duration / 2)) * FPS)
        if (scene.from) {
          frames.add(scene.from * FPS - 6)
        }
      }
      const folder = path.join(outputDir, 'frames', format)
      await fs.mkdir(folder, { recursive: true })
      for (const raw of [...frames].sort((a, b) => a - b)) {
        const frame = Math.floor(raw)
        await renderStill({ serveUrl, composition, frame, puppeteerInstance: browser, inputProps: { format, muted: true }, output: path.join(folder, `${String(frame).padStart(4, '0')}.png`), imageFormat: 'png', logLevel: 'warn' })
        console.log(`${format}: 关键帧 ${frame}`)
      }
      continue
    }
    await renderStill({ serveUrl, composition: cover, puppeteerInstance: browser, output: path.join(outputDir, `weapp-tailwindcss-${format}-cover.png`), imageFormat: 'png' })
    if (mode === 'covers') {
      continue
    }
    const rawPath = path.join(outputDir, `weapp-tailwindcss-${format}.render.mp4`)
    let lastProgress = -1
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      outputLocation: rawPath,
      codec: 'h264',
      crf: 18,
      x264Preset: 'fast',
      pixelFormat: 'yuv420p',
      colorSpace: 'bt709',
      audioCodec: 'aac',
      audioBitrate: '192k',
      imageFormat: 'jpeg',
      jpegQuality: 95,
      concurrency: Number(process.env.REMOTION_CONCURRENCY ?? 4),
      onProgress: ({ progress }) => {
        const percent = Math.floor(progress * 20) * 5
        if (percent !== lastProgress) {
          console.log(`${format}: ${percent}%`)
          lastProgress = percent
        }
      },
    })
    const final = path.join(outputDir, `weapp-tailwindcss-${format}.mp4`)
    await execa('ffmpeg', ['-v', 'error', '-y', '-i', rawPath, '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-movflags', '+faststart', final])
    await fs.unlink(rawPath)
    console.log(`完成：${final}`)
  }
}
finally {
  await browser.close({ silent: true })
}
