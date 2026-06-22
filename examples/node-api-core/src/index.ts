import process from 'node:process'
import { createContext } from 'weapp-tailwindcss/core'

const tailwindConfig = new URL('../tailwind.config.cjs', import.meta.url).pathname
const cssEntry = new URL('./app.css', import.meta.url).pathname

export interface DemoResult {
  js: string
  runtimeSetSize: number
  wxml: string
  wxss: string
}

export async function runNodeApiCoreDemo(): Promise<DemoResult> {
  const ctx = createContext({
    appType: 'native',
    tailwindcss: {
      config: tailwindConfig,
      v4: {
        cssEntries: [cssEntry],
      },
    },
  })
  const runtimeSet = await ctx.getRuntimeSet({
    forceCollect: true,
  })

  const wxml = await ctx.transformWxml(
    '<view class="mt-[8px] space-y-2.5"><text class="text-[23.43px] bg-[#123456]">Node API</text></view>',
  )
  const { css: wxss } = await ctx.transformWxss(
    [
      '.mt-\\[8px\\] { margin-top: 8px; }',
      '.space-y-2\\.5 > view + view { margin-top: 0.625rem; }',
      '.text-\\[23\\.43px\\] { font-size: 23.43px; }',
      '.bg-\\[\\#123456\\] { background-color: #123456; }',
      '.hover\\:bg-\\[\\#654321\\]:hover { background-color: #654321; }',
    ].join('\n'),
  )
  const { code: js } = await ctx.transformJs(
    'const classes = ["mb-[1.5rem]", "text-[23.43px]", "not-a-tailwind-token"]',
  )

  return {
    js,
    runtimeSetSize: runtimeSet.size,
    wxml,
    wxss,
  }
}

async function main() {
  const result = await runNodeApiCoreDemo()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
