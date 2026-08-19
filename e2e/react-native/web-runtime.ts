import fs from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'

function serve(directory: string) {
  const root = path.resolve(directory)
  const server = createServer((request, response) => {
    const requested = request.url?.split('?')[0] ?? '/'
    const file = path.resolve(root, requested === '/' ? 'index.html' : requested.replace(/^\/+/, ''))
    const relative = path.relative(root, file)
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403).end()
      return
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404).end()
        return
      }
      const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'
      response.writeHead(200, { 'content-type': type }).end(data)
    })
  })
  return new Promise<{ url: string, close: () => Promise<void> }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>(done => server.close(() => done())),
      })
    })
  })
}

export async function runWebRuntime(outputDirectory: string, screenshotFile: string) {
  const server = await serve(outputDirectory)
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 })
    await page.goto(server.url, { waitUntil: 'networkidle' })
    await page.getByText('Tailwind RN').waitFor()
    const root = page.getByTestId('tw-rn-root')
    const card = page.getByTestId('tw-rn-card')
    await page.waitForFunction(() => {
      const card = document.querySelector('[data-testid="tw-rn-card"]')
      const theme = document.querySelector('[data-testid="tw-rn-theme"]')
      if (!card || !theme) {
        return false
      }
      const cardBackground = getComputedStyle(card).backgroundColor
      const themeColor = getComputedStyle(theme).color
      return cardBackground !== 'rgba(0, 0, 0, 0)' && themeColor !== 'rgba(0, 0, 0, 0)'
    })
    const box = await card.boundingBox()
    const background = await card.evaluate(element => getComputedStyle(element).backgroundColor)
    const textColor = await page.getByTestId('tw-rn-theme').evaluate(element => getComputedStyle(element).color)
    if (!box || box.width <= 0 || box.height <= 0) {
      throw new Error('React Native Web root/card did not render a measurable layout')
    }
    if (!background || background === 'rgba(0, 0, 0, 0)') {
      throw new Error('React Native Web Tailwind background style is missing')
    }
    if (!textColor || textColor === 'rgba(0, 0, 0, 0)') {
      throw new Error('React Native Web Tailwind text style is missing')
    }
    await root.screenshot({ path: screenshotFile })
    return { box, background, textColor }
  }
  finally {
    await browser.close()
    await server.close()
  }
}
