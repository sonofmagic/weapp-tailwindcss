import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { describe, it } from 'vitest'
import { createWatchCommandSession, sleep } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import { waitFor, writeFilePreserveEol } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'

const templateRoot = path.resolve(__dirname, '../templates/generic-vite-tailwindcss-v4')
const sourceFile = path.resolve(templateRoot, 'src/main.ts')
const timeoutMs = Number(process.env['E2E_CANONICAL_TEMPLATE_HMR_TIMEOUT_MS'] ?? 180_000)
const pollMs = Number(process.env['E2E_CANONICAL_TEMPLATE_HMR_POLL_MS'] ?? 250)

async function readDevCss() {
  let response: Response
  try {
    response = await fetch('http://127.0.0.1:4173/src/style.css')
  }
  catch {
    return ''
  }
  if (!response.ok) {
    return ''
  }
  return response.text()
}

describe.sequential('canonical Generic Vite HMR', () => {
  it('regenerates CSS after adding and removing a class', async () => {
    if (process.env['E2E_CANONICAL_TEMPLATE_HMR_SKIP'] === '1') {
      return
    }

    const originalSource = await fs.readFile(sourceFile, 'utf8')
    const session = createWatchCommandSession(
      templateRoot,
      ['exec', 'vite', '--host', '127.0.0.1', '--port', '4173'],
      { quietSass: true },
    )

    try {
      await waitFor(
        async () => {
          session.ensureRunning()
          return (await readDevCss()).includes('.text-cyan-300')
        },
        {
          timeoutMs,
          pollMs,
          message: `Generic Vite did not serve generated CSS\n${session.logs()}`,
          onTick: session.ensureRunning,
        },
      )

      const withNewClass = originalSource.replace('text-cyan-300', 'text-emerald-400')
      await writeFilePreserveEol(sourceFile, withNewClass, originalSource)
      await sleep(Math.max(pollMs * 2, 500))
      await waitFor(
        async () => (await readDevCss()).includes('.text-emerald-400'),
        {
          timeoutMs,
          pollMs,
          message: `Generic Vite CSS did not include the added class\n${session.logs()}`,
          onTick: session.ensureRunning,
        },
      )

      await writeFilePreserveEol(sourceFile, originalSource, originalSource)
      await sleep(Math.max(pollMs * 2, 500))
      await waitFor(
        async () => !(await readDevCss()).includes('.text-emerald-400'),
        {
          timeoutMs,
          pollMs,
          message: `Generic Vite CSS kept a removed class\n${session.logs()}`,
          onTick: session.ensureRunning,
        },
      )
    }
    finally {
      await writeFilePreserveEol(sourceFile, originalSource, originalSource).catch(() => undefined)
      await session.stop()
    }
  }, timeoutMs + 60_000)
})
