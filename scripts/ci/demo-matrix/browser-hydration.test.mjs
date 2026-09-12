import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import { expect, it } from 'vitest'
import { openBrowser } from './browser.mjs'
import { repo } from './catalog.mjs'

it('waits for Vue hydration when SSR markup and the update transport are already present', async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'demo-hydration-')))
  const requireDemo = createRequire(path.join(repo, 'demo/uni-app-vite-tailwindcss-v4/package.json'))
  await writeFile(path.join(root, 'entry.js'), `
    import { createSSRApp, h, onMounted } from 'vue'
    createSSRApp({ setup() {
      onMounted(() => console.log('hydration-complete'))
      return () => h('div', { id: 'tw-matrix-height' }, 'ready')
    } }).mount('#app')
  `)
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    resolve: { alias: { vue: requireDemo.resolve('vue/dist/vue.esm-bundler.js') } },
    server: { host: '127.0.0.1', port: 0, fs: { allow: [root, repo] } },
    plugins: [{
      name: 'delayed-hydration',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== '/') {
            return next()
          }
          res.setHeader('Content-Type', 'text/html')
          res.end(`<script type="module" src="/@vite/client"></script>
            <script type="module">setTimeout(() => import('/entry.js'), 1500)</script>
            <div id="app"><div id="tw-matrix-height">ready</div></div>`)
        })
      },
    }],
  })
  let browser
  const deadline = Date.now() + 20_000
  try {
    await server.listen()
    browser = await openBrowser(server.resolvedUrls.local[0], {
      ensureRunning() { expect(Date.now()).toBeLessThan(deadline) },
    }, root, { vueHydration: true })
    expect(browser.events).toContain('log: hydration-complete')
  }
  finally {
    await browser?.close()
    await server.close()
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)
