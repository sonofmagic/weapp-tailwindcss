import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { expect, it } from 'vitest'
import { openBrowser } from './browser.mjs'

it('does not restart a page whose initialization exceeds the probe polling interval', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'demo-matrix-browser-'))
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
