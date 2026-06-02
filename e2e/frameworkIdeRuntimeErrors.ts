import process from 'node:process'
import { inspect } from 'node:util'

interface RuntimeErrorRecord {
  source: string
  message: string
  payload?: unknown
}

function stringifyPayload(payload: unknown) {
  if (typeof payload === 'string') {
    return payload
  }
  if (payload instanceof Error) {
    return payload.stack ?? payload.message
  }
  return inspect(payload, {
    depth: 4,
    maxArrayLength: 20,
    maxStringLength: 1000,
    breakLength: 120,
  })
}

function normalizeConsoleLevel(payload: any) {
  return String(
    payload?.level
    ?? payload?.type
    ?? payload?.method
    ?? payload?.logType
    ?? '',
  ).toLowerCase()
}

function normalizeConsoleText(payload: any) {
  const args = payload?.args
  if (Array.isArray(args)) {
    return args.map(stringifyPayload).join(' ')
  }
  return String(
    payload?.text
    ?? payload?.message
    ?? payload?.msg
    ?? stringifyPayload(payload),
  )
}

function isConsoleRuntimeError(payload: unknown) {
  const candidate = payload as any
  const level = normalizeConsoleLevel(candidate)
  if (level === 'error' || level === 'exception') {
    return true
  }

  const text = normalizeConsoleText(candidate)
  return /\b(?:ReferenceError|TypeError|SyntaxError|RangeError|UnhandledPromiseRejection|Uncaught(?:\s+\w+)?Error)\b/i.test(text)
}

function formatRuntimeErrors(caseName: string, stage: string, errors: RuntimeErrorRecord[]) {
  const body = errors
    .map((item, index) => {
      const payload = item.payload === undefined ? '' : `\n  payload: ${stringifyPayload(item.payload)}`
      return `${index + 1}. [${item.source}] ${item.message}${payload}`
    })
    .join('\n')
  return `[e2e:ide] ${caseName} reported runtime errors during ${stage}:\n${body}`
}

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

async function withRuntimeHookTimeout(caseName: string, task: Promise<unknown>) {
  const timeoutMs = readNumberEnv('E2E_IDE_RUNTIME_HOOK_TIMEOUT_MS', 3000)
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      task,
      new Promise<void>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`runtime hook timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  }
  catch (error) {
    process.stderr.write(`[e2e:ide] ${caseName} runtime wx hook skipped: ${stringifyPayload(error)}\n`)
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export function installFrameworkIdeRuntimeErrorCollector(caseName: string, miniProgram: any) {
  const protocolErrors: RuntimeErrorRecord[] = []

  miniProgram.on('exception', (payload: unknown) => {
    protocolErrors.push({
      source: 'automator.exception',
      message: stringifyPayload(payload),
      payload,
    })
  })

  miniProgram.on('console', (payload: unknown) => {
    if (!isConsoleRuntimeError(payload)) {
      return
    }
    protocolErrors.push({
      source: 'automator.console',
      message: normalizeConsoleText(payload as any),
      payload,
    })
  })

  void withRuntimeHookTimeout(caseName, miniProgram.evaluate(`function () {
    var root = globalThis
    if (!Array.isArray(root.__WEAPP_TW_E2E_RUNTIME_ERRORS__)) {
      root.__WEAPP_TW_E2E_RUNTIME_ERRORS__ = []
    }
    if (root.__WEAPP_TW_E2E_RUNTIME_ERROR_COLLECTOR_INSTALLED__) {
      return
    }
    root.__WEAPP_TW_E2E_RUNTIME_ERROR_COLLECTOR_INSTALLED__ = true

    var push = function (source, payload) {
      var fallbackMessage = ''
      try {
        fallbackMessage = JSON.stringify(payload)
      }
      catch {
        fallbackMessage = String(payload)
      }
      var message = typeof payload === 'string'
        ? payload
        : payload instanceof Error
          ? payload.stack || payload.message
          : fallbackMessage
      root.__WEAPP_TW_E2E_RUNTIME_ERRORS__.push({
        source,
        message,
        payload,
      })
      if (root.console && root.console.error) {
        root.console.error('[weapp-tailwindcss:e2e-runtime-error]', source, message)
      }
    }

    var wxApi = root.wx
    if (wxApi && wxApi.onError) {
      wxApi.onError(function (message) {
        push('wx.onError', message)
      })
    }
    if (wxApi && wxApi.onUnhandledRejection) {
      wxApi.onUnhandledRejection(function (event) {
        push('wx.onUnhandledRejection', event)
      })
    }
  }`))

  return {
    async assertNoErrors(stage: string) {
      if (protocolErrors.length > 0) {
        throw new Error(formatRuntimeErrors(caseName, stage, protocolErrors))
      }
      process.stdout.write(`[e2e:ide] ${caseName} runtime clean after ${stage}\n`)
    },
  }
}
