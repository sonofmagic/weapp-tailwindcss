import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { expect, it } from 'vitest'
import { openBrowser } from './browser.mjs'

it('does not restart a page whose initialization exceeds the probe polling interval', async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'demo-matrix-browser-')))
  let navigations = 0
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
      name: 'delayed-page',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/') {
            return next()
          }
          navigations++
          res.setHeader('Content-Type', 'text/html')
          res.end('<script type="module" src="/@vite/client"></script><script>setTimeout(() => { document.body.innerHTML = \'<div id="tw-matrix-height">ready</div>\' }, 6000)</script><body></body>')
        })
      },
    }],
  })
  let browser
  try {
    await server.listen()
    browser = await openBrowser(server.resolvedUrls.local[0], undefined, root)
    expect(navigations).toBe(1)
  }
  finally {
    await browser?.close()
    await server.close()
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)

it('waits for local scripts while allowing a persistent background request', async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'demo-matrix-readiness-')))
  let background
  let backgroundStarted = false
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
      name: 'persistent-request-page',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/background') {
            background = res
            backgroundStarted = true
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.write('pending')
          }
          else if (req.url === '/delayed.js') {
            res.setHeader('Content-Type', 'text/javascript')
            setTimeout(() => res.end('console.log("local-script-ready")'), 1000)
          }
          else if (req.url === '/') {
            res.setHeader('Content-Type', 'text/html')
            res.end('<script type="module" src="/@vite/client"></script><script>fetch("/background")</script><script async src="/delayed.js"></script><div id="tw-matrix-height">ready</div>')
          }
          else { next() }
        })
      },
    }],
  })
  let browser
  try {
    await server.listen()
    browser = await openBrowser(server.resolvedUrls.local[0], undefined, root)
    expect(backgroundStarted).toBe(true)
    expect(background.writableEnded).toBe(false)
    expect(browser.events).toContain('log: local-script-ready')
  }
  finally {
    background?.end()
    await browser?.close()
    await server.close()
    await rm(root, { recursive: true, force: true })
  }
}, 15_000)
