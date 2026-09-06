import { expect, it } from 'vitest'
import { cases } from './catalog.mjs'
import { inspectStyles } from './output.mjs'

const item = cases.find(item => item.id === 'issue-1144-uni-app-x-web:h5')
const inlineCss = String.raw`
.h-8 { height: 8px }
.h-20 { height: 20px }
.h-50 { height: 50px }
.mt-2 { margin-top: 2px }
.flex { display: flex }
.text-slate-500 { color: #62748e }
.h-\[64px\] { height: 64px }
.h-\[400px\] { height: 400px }
.bg-emerald-50\/80 { background-color: rgba(236, 253, 245, .8) }
`

it('compares inline utility semantics independently of unused theme declarations', () => {
  const baseline = inspectStyles([inlineCss], item)
  expect(baseline.spacing).toEqual([])
  expect(inspectStyles([`:root { --spacing: .25rem } ${inlineCss}`], item)).toEqual(baseline)
})

it('requires and records spacing when a consumed utility references it', () => {
  const css = inlineCss.replace('height: 8px', 'height: calc(var(--spacing) * 8)')
  expect(() => inspectStyles([css], item)).toThrow('missing spacing dependency')
  expect(inspectStyles([`:root { --spacing: 1px } ${css}`], item).spacing).toEqual(['1px'])
})

it('still rejects missing utilities and inconsistent inline spacing', () => {
  expect(() => inspectStyles([inlineCss.replace('.h-50 { height: 50px }', '')], item)).toThrow('missing h-50')
  expect(() => inspectStyles([inlineCss.replace('height: 8px', 'height: 16px')], item)).toThrow('inconsistent spacing multiples')
})
