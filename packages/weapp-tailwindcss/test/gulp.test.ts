import type internal from 'node:stream'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gulpCasePath } from '#test/util'
import gulp from 'gulp'
import { createPlugins } from '@/gulp'

function promisify(task: internal.Transform) {
  return new Promise((resolve, reject) => {
    if (task.destroyed) {
      resolve(undefined)
      return
    }
    task.on('finish', resolve).on('error', reject)
  })
}

function readContent(task: internal.Transform) {
  return new Promise((resolve, reject) => {
    task
      .on('data', (file) => {
        const result = file.contents.toString('utf8')
        resolve(result)
      })
      .on('error', reject)
  })
}

function normalizeSnapshotContent(content: unknown) {
  return String(content).replace(/[ \t]+$/gm, '')
}

async function matchSnap(plugins: ReturnType<typeof createPlugins>) {
  const { transformJs, transformWxml, transformWxss } = plugins
  // const cssPath = path.resolve(gulpCasePath, '*.css')

  const cssTask = gulp
    .src('./src/**/*.css', {
      cwd: gulpCasePath,
    })
    .pipe(transformWxss())

  const result = await readContent(cssTask)
  expect(normalizeSnapshotContent(result)).toMatchSnapshot('css')
  await promisify(cssTask)

  const jsTask = gulp
    .src('./src/**/*.js', {
      cwd: gulpCasePath,
    })
    .pipe(transformJs())

  const wxmlTask = gulp
    .src('./src/**/*.wxml', {
      cwd: gulpCasePath,
    })
    .pipe(transformWxml())

  const ptasks = [jsTask, wxmlTask]
  const [jsRes, wxmlRes] = await Promise.all(ptasks.map(element => readContent(element)))
  expect(normalizeSnapshotContent(jsRes)).toMatchSnapshot('js')
  expect(normalizeSnapshotContent(wxmlRes)).toMatchSnapshot('wxml')
  await Promise.all(ptasks.map(element => promisify(element)))
}
describe('gulp', () => {
  it('common build', async () => {
    await matchSnap(createPlugins({
      tailwindcssBasedir: gulpCasePath,
      mainCssChunk(name) {
        return path.basename(name) === 'index.css'
      },
    }))
  })

  it('refreshes generated css when watched templates add new classes', async () => {
    const tempRoot = path.join(tmpdir(), `weapp-tw-gulp-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const srcRoot = path.join(tempRoot, 'src')

    await mkdir(srcRoot, { recursive: true })
    await writeFile(path.join(tempRoot, 'tailwind.config.js'), `
module.exports = {
  content: ['./src/**/*.wxml'],
  corePlugins: { preflight: false },
}
`, 'utf8')
    await writeFile(path.join(srcRoot, 'index.css'), '@tailwind utilities;', 'utf8')
    const wxmlPath = path.join(srcRoot, 'index.wxml')
    await writeFile(wxmlPath, '<view class="text-xs"></view>', 'utf8')

    const cwd = process.cwd()
    try {
      process.chdir(tempRoot)
      const plugins = createPlugins({
        tailwindcssBasedir: tempRoot,
        mainCssChunk(name) {
          return path.basename(name) === 'index.css'
        },
      })
      const readGeneratedCss = async () => {
        const cssTask = gulp
          .src('./src/index.css', {
            cwd: tempRoot,
          })
          .pipe(plugins.transformWxss())

        const css = await readContent(cssTask)
        await promisify(cssTask)
        return normalizeSnapshotContent(css)
      }

      const initialCss = await readGeneratedCss()
      expect(initialCss).not.toContain('bg-_bred_B')

      await writeFile(wxmlPath, '<view class="text-xs bg-[red]"></view>', 'utf8')
      const nextCss = await readGeneratedCss()
      expect(nextCss).toContain('bg-_bred_B')
    }
    finally {
      process.chdir(cwd)
      await rm(tempRoot, { force: true, recursive: true })
    }
  })

  it('refreshes generated css when watched scripts add new classes', async () => {
    const tempRoot = path.join(tmpdir(), `weapp-tw-gulp-script-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const srcRoot = path.join(tempRoot, 'src')

    await mkdir(srcRoot, { recursive: true })
    await writeFile(path.join(tempRoot, 'tailwind.config.js'), `
module.exports = {
  content: ['./src/**/*.{js,ts,wxml}'],
  corePlugins: { preflight: false },
}
`, 'utf8')
    await writeFile(path.join(srcRoot, 'index.css'), '@tailwind utilities;', 'utf8')
    const scriptPath = path.join(srcRoot, 'index.js')
    await writeFile(scriptPath, 'export const className = "text-xs"', 'utf8')

    const cwd = process.cwd()
    try {
      process.chdir(tempRoot)
      const plugins = createPlugins({
        tailwindcssBasedir: tempRoot,
        mainCssChunk(name) {
          return path.basename(name) === 'index.css'
        },
      })
      const readGeneratedCss = async () => {
        const cssTask = gulp
          .src('./src/index.css', {
            cwd: tempRoot,
          })
          .pipe(plugins.transformWxss())

        const css = await readContent(cssTask)
        await promisify(cssTask)
        return normalizeSnapshotContent(css)
      }
      const transformScript = async () => {
        const jsTask = gulp
          .src('./src/index.js', {
            cwd: tempRoot,
          })
          .pipe(plugins.transformJs())

        await readContent(jsTask)
        await promisify(jsTask)
      }

      const initialCss = await readGeneratedCss()
      expect(initialCss).not.toContain('bg-_b_h0f0_B')

      await writeFile(scriptPath, 'export const className = "text-xs bg-[#0f0]"', 'utf8')
      await transformScript()
      const nextCss = await readGeneratedCss()
      expect(nextCss).toContain('bg-_b_h0f0_B')
    }
    finally {
      process.chdir(cwd)
      await rm(tempRoot, { force: true, recursive: true })
    }
  })
})
