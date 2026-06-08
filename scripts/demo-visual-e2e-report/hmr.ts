import type { Page } from 'playwright'
import type { WebCase, WebRuntimeStyleAssertion } from '../../e2e/hbuilderx-local/cases.ts'
import type { TaroWebHmrCase } from '../../e2e/taro-web-demo-hmr-cases.ts'
import type { WebViteHmrCase } from '../../e2e/web-vite-demo-hmr-cases.ts'
import type { H5HmrVisualConfig } from './cases.ts'
import type { MiniProgramHmrVisualConfig } from './types.ts'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { webCases } from '../../e2e/hbuilderx-local/cases.ts'
import { buildCases } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/index.ts'
import { writeFilePreserveEol } from '../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text.ts'

const pollIntervalMs = 150
const hmrTimeoutMs = Number(process.env['DEMO_VISUAL_HMR_TIMEOUT_MS'] ?? process.env['DEMO_VISUAL_TIMEOUT_MS'] ?? 180_000)

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function joinUrl(baseUrl: string, pathname: string) {
  return new URL(pathname, baseUrl).toString()
}

async function fetchText(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status} ${response.statusText}`)
  }
  return await response.text()
}

async function waitFor<T>(
  label: string,
  task: () => Promise<T | undefined>,
) {
  const startedAt = Date.now()
  let lastError = ''
  while (Date.now() - startedAt < hmrTimeoutMs) {
    try {
      const value = await task()
      if (value != null) {
        return value
      }
      lastError = 'predicate returned empty'
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await wait(pollIntervalMs)
  }
  throw new Error(`${label} 超时：${lastError}`)
}

async function mutateFile(
  sourceFile: string,
  mutate: (source: string) => string,
) {
  const original = await fs.readFile(sourceFile, 'utf8')
  const next = mutate(original)
  if (next === original) {
    throw new Error(`HMR 源码替换没有产生变化：${sourceFile}`)
  }
  await writeFilePreserveEol(sourceFile, next, original)
  return async () => {
    await writeFilePreserveEol(sourceFile, original, original)
  }
}

async function readTextIfExists(file: string) {
  return await fs.readFile(file, 'utf8').catch(() => '')
}

function createMiniProgramVisualSnippet(sourceFile: string, marker: string) {
  const classLiteral = 'bg-[#ff0000] text-[#ffffff] text-[32rpx] px-[24rpx] py-[16rpx]'
  if (/\.(?:tsx|jsx)$/.test(sourceFile)) {
    return {
      classLiteral,
      snippet: `<View className="${classLiteral}">${marker}</View>`,
      anchors: ['<View className=\'index\'>', '<View className="index">', '<View>', '<>'],
    }
  }
  return {
    classLiteral,
    snippet: `<view class="${classLiteral}">${marker}</view>`,
    anchors: [
      '<view class="space-y-2.5">',
      '<view class="index">',
      '<view class="p-4">',
      '<view class="content">',
      '<view class="flex flex-col items-center py-4">',
      '<view class="flex flex-col">',
      '<view class="bg-[#123456]">',
      '<view class="bg-[#e90505] text-purple-600 tw-root">',
      '<view>',
    ],
  }
}

function insertMiniProgramVisualSnippet(source: string, sourceFile: string, marker: string) {
  const visual = createMiniProgramVisualSnippet(sourceFile, marker)
  const anchor = visual.anchors.find(item => source.includes(item))
  if (!anchor) {
    throw new Error(`找不到小程序可视 HMR 插入锚点：${sourceFile}`)
  }
  const index = source.indexOf(anchor) + anchor.length
  return {
    classLiteral: visual.classLiteral,
    source: `${source.slice(0, index)}\n${visual.snippet}${source.slice(index)}`,
  }
}

function resolveAnchor(source: string, anchors: string[]) {
  return anchors.find(anchor => source.includes(anchor))
}

async function insertHBuilderXWebMarker(sourceFile: string, item: WebCase, stepIndex: number) {
  const anchors = item.markerAnchorCandidates?.length ? item.markerAnchorCandidates : [item.markerAnchor]
  return await mutateFile(sourceFile, (source) => {
    const markerRE = /\n\t\t<view class="[^"]+">hbuilderx-web-hmr-[^<]+<\/view>/g
    const cleaned = source.replace(markerRE, '')
    const anchor = resolveAnchor(cleaned, anchors)
    const index = anchor ? cleaned.indexOf(anchor) : -1
    if (index < 0) {
      throw new Error(`${item.name} 找不到 HBuilderX Web HMR 插入锚点：${sourceFile}`)
    }
    const insertion = item.hmrSteps
      .slice(0, stepIndex + 1)
      .map(step => `<view class="${step.markerClass}">${step.markerText}</view>`)
      .join('\n\t\t')
    return `${cleaned.slice(0, index)}${insertion}\n\t\t${cleaned.slice(index)}`
  })
}

async function waitForRedDomMarker(
  page: Page,
  selector: string,
  expectedText: string,
  label: string,
) {
  return await waitFor(label, async () => {
    const locator = page.locator(selector)
    const count = await locator.count()
    if (count === 0) {
      return undefined
    }
    const actual = await locator.first().evaluate((element) => {
      const style = window.getComputedStyle(element)
      return {
        color: style.color.replace(/\s+/g, ' '),
        text: element.textContent?.trim() ?? '',
      }
    })
    if (actual.text.includes(expectedText) && actual.color === 'rgb(255, 0, 0)') {
      return actual
    }
    return undefined
  })
}

async function reloadForScreenshot(page: Page, url: string) {
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: Math.min(hmrTimeoutMs, 60_000),
  })
  await page.waitForFunction(() => document.readyState !== 'loading', undefined, { timeout: 30_000 })
}

function matchesExpectedStyle(actual: string, expected: string | RegExp) {
  return typeof expected === 'string' ? actual === expected : expected.test(actual)
}

async function collectRuntimeStyle(page: Page, selector: string) {
  return await page.locator(selector).first().evaluate((element) => {
    const style = window.getComputedStyle(element)
    return {
      alignItems: style.alignItems,
      backgroundColor: style.backgroundColor.replace(/\s+/g, ' '),
      borderRadius: style.borderRadius,
      color: style.color.replace(/\s+/g, ' '),
      display: style.display,
      flexDirection: style.flexDirection,
      height: style.height,
      marginTop: style.marginTop,
      text: element.textContent?.trim() ?? '',
      width: style.width,
    }
  })
}

async function collectRuntimePageEvidence(page: Page) {
  return await page.evaluate(() => {
    const pick = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) {
        return null
      }
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return {
        backgroundColor: style.backgroundColor.replace(/\s+/g, ' '),
        className: element.getAttribute('class') ?? '',
        color: style.color.replace(/\s+/g, ' '),
        display: style.display,
        rect: {
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        },
        selector,
        text: element.textContent?.trim().slice(0, 160) ?? '',
      }
    }
    return {
      bodyText: document.body?.textContent?.trim().slice(0, 320) ?? '',
      readyState: document.readyState,
      samples: ['body', '#app', 'uni-page-body', '.content', '.test']
        .map(pick)
        .filter(Boolean),
      url: location.href,
    }
  })
}

async function waitForRuntimeAssertions(page: Page, assertions: WebRuntimeStyleAssertion[] | undefined, label: string) {
  if (!assertions?.length) {
    return undefined
  }
  let latestEvidence: Record<string, unknown> | undefined
  try {
    return await waitFor(label, async () => {
      const evidence: Record<string, unknown> = {}
      for (const assertion of assertions) {
        const count = await page.locator(assertion.selector).count()
        if (count === 0) {
          latestEvidence = {
            ...evidence,
            [assertion.selector]: { missing: true },
          }
          return undefined
        }
        const actual = await collectRuntimeStyle(page, assertion.selector)
        evidence[assertion.selector] = actual
        latestEvidence = evidence
        for (const [key, expected] of Object.entries(assertion.styles)) {
          const actualValue = actual[key as keyof typeof actual]
          if (typeof actualValue !== 'string' || !matchesExpectedStyle(actualValue, expected)) {
            return undefined
          }
        }
      }
      return evidence
    })
  }
  catch (error) {
    const pageEvidence = await collectRuntimePageEvidence(page).catch(() => undefined)
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nlatest=${JSON.stringify(latestEvidence)}\npage=${JSON.stringify(pageEvidence)}`)
  }
}

async function waitForCssIncludes(url: string, expected: Array<string | RegExp>, label: string) {
  return await waitFor(label, async () => {
    const css = await fetchText(url)
    const missing = expected.filter(item => typeof item === 'string' ? !css.includes(item) : !item.test(css))
    if (missing.length === 0) {
      return { cssPath: url, matched: expected.map(String) }
    }
    return undefined
  })
}

function createHBuilderXWebHmrVisualConfig(item: WebCase): H5HmrVisualConfig {
  const step = item.hmrSteps[0]!
  return {
    label: `${item.name} ${step.markerText}`,
    async waitForReady(page, url) {
      const cssEvidence = await waitForCssIncludes(
        joinUrl(url, item.initialCssPath),
        item.initialCssContains,
        `${item.name} HBuilderX Web initial CSS`,
      )
      const runtimeEvidence = await waitForRuntimeAssertions(page, item.initialRuntimeStyles, `${item.name} HBuilderX Web initial runtime`)
      return { css: cssEvidence, runtime: runtimeEvidence }
    },
    async mutate(projectRoot) {
      const sourceFile = path.resolve(projectRoot, item.sourceFile)
      return await insertHBuilderXWebMarker(sourceFile, item, 0)
    },
    async waitForUpdate(page, url) {
      const cssEvidence = await waitForCssIncludes(
        joinUrl(url, item.hmrCssPath),
        step.cssContains,
        `${item.name} HBuilderX Web CSS HMR`,
      )
      const runtimeEvidence = await waitForRuntimeAssertions(page, step.runtimeStyles, `${item.name} HBuilderX Web runtime HMR`)
      await reloadForScreenshot(page, url)
      await page.locator(`text=${step.markerText}`).first().waitFor({ timeout: 30_000 })
      return { css: cssEvidence, runtime: runtimeEvidence, text: step.markerText }
    },
  }
}

export function createTaroHmrVisualConfig(item: TaroWebHmrCase): H5HmrVisualConfig {
  return {
    label: item.name,
    async mutate(projectRoot) {
      const sourceFile = path.resolve(projectRoot, item.sourceFile)
      return await mutateFile(sourceFile, (source) => {
        const anchor = item.anchors.find(candidate => source.includes(candidate))
        if (!anchor) {
          throw new Error(`${item.name} 找不到 HMR 插入锚点：${sourceFile}`)
        }
        return source.replace(anchor, `${item.insertion}\n${anchor}`)
      })
    },
    async waitForUpdate(page, url) {
      if (item.assertion === 'css') {
        const cssPaths = item.cssPaths ?? []
        const cssEvidence = await waitFor(`${item.name} Taro H5 CSS HMR`, async () => {
          for (const cssPath of cssPaths) {
            const latest = await fetchText(joinUrl(url, cssPath))
            if (/(?:#|_h)ff0000|rgb\(255(?:\s+|,\s*)0(?:\s+|,\s*)0\)/i.test(latest)) {
              return { cssPath, matched: 'red text color' }
            }
          }
          return undefined
        })
        await reloadForScreenshot(page, url)
        await page.locator(`[data-taro-web-hmr="${item.markerAttr}"]`).first().waitFor({ timeout: 30_000 })
        return cssEvidence
      }
      return await waitForRedDomMarker(
        page,
        `[data-taro-web-hmr="${item.markerAttr}"]`,
        item.markerText,
        `${item.name} Taro H5 DOM HMR`,
      )
    },
  }
}

export function createWebViteHmrVisualConfig(item: WebViteHmrCase): H5HmrVisualConfig {
  return {
    label: item.name,
    async mutate(projectRoot) {
      const sourceFile = path.resolve(projectRoot, item.sourceFile)
      return await mutateFile(sourceFile, source => source
        .replace(item.classFrom, item.classTo)
        .replace(item.titleFrom, item.titleTo))
    },
    async waitForUpdate(page) {
      return await waitForRedDomMarker(
        page,
        `[data-web-vite-hmr="${item.markerAttr}"]`,
        item.titleTo,
        `${item.name} Web Vite HMR`,
      )
    },
  }
}

export function createUniH5HmrVisualConfig(repoRoot: string, name: string): H5HmrVisualConfig | undefined {
  const hbuilderxWebCase = webCases.find(item => item.name === name)
  if (hbuilderxWebCase) {
    return createHBuilderXWebHmrVisualConfig(hbuilderxWebCase)
  }
  const watchCase = buildCases(repoRoot, { includeLocalOnly: true }).find(item => item.name === name)
  const sequence = watchCase?.webHmr?.sourceDomReplacementSequence?.[0]
  if (!watchCase) {
    return undefined
  }
  if (!watchCase.webHmr || !sequence) {
    const marker = `DEMO-VISUAL-HMR-${name}`
    return {
      label: `${watchCase.label} template visual HMR`,
      async mutate() {
        return await mutateFile(watchCase.templateMutation.sourceFile, (source) => {
          if (source.includes('写法示例Start!')) {
            return source
              .replace('class="text-xl text-gray-600/95"', 'class="text-[red] font-bold"')
              .replace('写法示例Start!', marker)
          }
          return watchCase.templateMutation.mutate(source, {
            classLiteral: 'text-[red] font-bold',
            classVariableName: '__twVisualHmrClass',
            marker,
          })
        })
      },
      async waitForUpdate(page) {
        return await waitFor(`${watchCase.label} H5 template HMR`, async () => {
          const actual = await page.evaluate((expectedMarker) => {
            const elements = Array.from(document.querySelectorAll('body *'))
            const element = elements.find(item => item.textContent?.includes(expectedMarker))
            if (!element) {
              return undefined
            }
            const style = window.getComputedStyle(element)
            return {
              color: style.color.replace(/\s+/g, ' '),
              text: element.textContent?.trim() ?? '',
            }
          }, marker)
          if (actual?.text.includes(marker) && actual.color === 'rgb(255, 0, 0)') {
            return actual
          }
          return undefined
        })
      },
    }
  }
  return {
    label: `${watchCase.label} ${sequence.label}`,
    async waitForReady(page) {
      const readySelector = watchCase.webHmr?.readySelector
      if (!readySelector) {
        return undefined
      }
      return await waitFor(`${watchCase.label} H5 initial ready`, async () => {
        const count = await page.locator(readySelector).count()
        return count > 0 ? { readySelector } : undefined
      })
    },
    async mutate() {
      return await mutateFile(watchCase.webHmr!.sourceFile, source => sequence.mutate(source).next)
    },
    async waitForUpdate(page) {
      const selector = '[data-tw-watch-web-dom="1"]'
      return await waitFor(`${watchCase.label} H5 DOM HMR`, async () => {
        const locator = page.locator(selector)
        const count = await locator.count()
        if (count === 0) {
          return undefined
        }
        const actual = await locator.first().evaluate((element) => {
          const style = window.getComputedStyle(element)
          return {
            backgroundColor: style.backgroundColor.replace(/\s+/g, ' '),
            color: style.color.replace(/\s+/g, ' '),
            text: element.textContent?.trim() ?? '',
          }
        })
        const expectedColor = sequence.expectedStyle?.color
        const expectedBackgroundColor = sequence.expectedStyle?.backgroundColor
        if (!actual.text.includes(sequence.expectedText)) {
          return undefined
        }
        if (expectedColor && actual.color !== expectedColor) {
          return undefined
        }
        if (expectedBackgroundColor && actual.backgroundColor !== expectedBackgroundColor) {
          return undefined
        }
        return actual
      })
    },
  }
}

export function createMiniProgramHmrVisualConfig(repoRoot: string, name: string): MiniProgramHmrVisualConfig | undefined {
  const watchCase = buildCases(repoRoot, { includeLocalOnly: true }).find(item => item.name === name)
  if (!watchCase) {
    return undefined
  }
  const mutation = watchCase.templateMutation
  return {
    label: `${watchCase.label} mini-program template visual HMR`,
    watchCase,
    async mutate() {
      const sourceFile = mutation.sourceFile
      const original = await fs.readFile(sourceFile, 'utf8')
      const marker = `tw-visual-weapp-${watchCase.name}-${Date.now().toString().slice(-6)}`
      const [baselineWxml, baselineJs, baselineGlobalStyle] = await Promise.all([
        readTextIfExists(watchCase.outputWxml),
        readTextIfExists(watchCase.outputJs),
        Promise.all([...watchCase.outputStyleCandidates, ...watchCase.globalStyleCandidates].map(readTextIfExists))
          .then(items => items.join('\n')),
      ])
      if (baselineWxml.includes(marker) || baselineJs.includes(marker) || baselineGlobalStyle.includes(marker)) {
        throw new Error(`[${watchCase.label}] 小程序可视 HMR marker 已存在：${marker}`)
      }
      const next = insertMiniProgramVisualSnippet(original, sourceFile, marker)
      await writeFilePreserveEol(sourceFile, next.source, original)
      return {
        marker,
        restore: async () => {
          await writeFilePreserveEol(sourceFile, original, original)
        },
      }
    },
  }
}
