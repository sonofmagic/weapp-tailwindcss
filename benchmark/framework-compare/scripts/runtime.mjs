import process from 'node:process'
import { now, sleep, summarize } from './shared.mjs'

async function withTimeout(taskPromise, timeoutMs, label) {
  let timer
  try {
    return await Promise.race([
      taskPromise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timeout ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

async function waitForFirstWxml(page, relaunchStartedAt, options, key) {
  while (now() - relaunchStartedAt <= options.timeoutMs) {
    const pageRoot = await page.$('page')
    const wxml = await pageRoot?.wxml()
    if (typeof wxml === 'string' && wxml.trim().length > 0) {
      return now() - relaunchStartedAt
    }
    await sleep(options.pollMs)
  }
  throw new Error(`[${key}] runtime first wxml timeout`)
}

async function collectSetDataLatency(page, key, options) {
  const list = []
  for (let index = 0; index < options.setDataRuns; index += 1) {
    const value = `${Date.now()}-${index}`
    const startedAt = now()
    await page.setData({ __twFrameworkBench: value })
    const current = await page.data('__twFrameworkBench')
    if (current !== value) {
      throw new Error(`[${key}] runtime setData value mismatch`)
    }
    list.push(now() - startedAt)
  }
  return list
}

async function collectWxmlQueryLatency(page, key, options) {
  const list = []
  for (let index = 0; index < options.wxmlQueryRuns; index += 1) {
    const startedAt = now()
    const pageRoot = await page.$('page')
    const wxml = await pageRoot?.wxml()
    if (typeof wxml !== 'string' || wxml.trim().length === 0) {
      throw new Error(`[${key}] runtime wxml query returned empty content`)
    }
    list.push(now() - startedAt)
  }
  return list
}

function average(values) {
  if (!values.length) {
    return 0
  }
  return values.reduce((acc, item) => acc + item, 0) / values.length
}

export async function runRuntimeRounds(automator, caseMeta, casePaths, options) {
  const rounds = []
  for (let index = 0; index < options.runtimeRuns; index += 1) {
    const launchStartedAt = now()
    const miniProgram = await withTimeout(
      automator.launch({
        projectPath: casePaths.runtimeProjectPath,
      }),
      options.runtimeTimeoutMs,
      `[${caseMeta.key}] automator.launch`,
    )

    try {
      const launchMs = now() - launchStartedAt
      const relaunchStartedAt = now()
      const page = await withTimeout(
        miniProgram.reLaunch(caseMeta.runtimeUrl),
        options.runtimeTimeoutMs,
        `[${caseMeta.key}] miniProgram.reLaunch`,
      )
      const relaunchMs = now() - relaunchStartedAt
      const firstWxmlMs = await withTimeout(
        waitForFirstWxml(page, relaunchStartedAt, options, caseMeta.key),
        options.runtimeTimeoutMs,
        `[${caseMeta.key}] waitForFirstWxml`,
      )
      const setDataLatency = await withTimeout(
        collectSetDataLatency(page, caseMeta.key, options),
        options.runtimeTimeoutMs,
        `[${caseMeta.key}] collectSetDataLatency`,
      )
      const wxmlQueryLatency = await withTimeout(
        collectWxmlQueryLatency(page, caseMeta.key, options),
        options.runtimeTimeoutMs,
        `[${caseMeta.key}] collectWxmlQueryLatency`,
      )
      rounds.push({
        launchMs,
        relaunchMs,
        firstWxmlMs,
        setDataLatency,
        wxmlQueryLatency,
        setDataAvgMs: average(setDataLatency),
        wxmlQueryAvgMs: average(wxmlQueryLatency),
      })
      process.stdout.write(
        `[framework-matrix] ${caseMeta.key} runtime ${index + 1}/${options.runtimeRuns}: launch=${launchMs.toFixed(2)}ms firstWxml=${firstWxmlMs.toFixed(2)}ms setDataAvg=${average(setDataLatency).toFixed(2)}ms\n`,
      )
    }
    finally {
      await miniProgram.close()
    }
  }
  return rounds
}

export function summarizeRuntime(rounds) {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    return null
  }
  return {
    count: rounds.length,
    launchMs: summarize(rounds.map(item => item.launchMs)),
    relaunchMs: summarize(rounds.map(item => item.relaunchMs)),
    firstWxmlMs: summarize(rounds.map(item => item.firstWxmlMs)),
    setDataAvgMs: summarize(rounds.map(item => item.setDataAvgMs)),
    wxmlQueryAvgMs: summarize(rounds.map(item => item.wxmlQueryAvgMs)),
  }
}
