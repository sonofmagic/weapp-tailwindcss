import { bench, describe } from 'vitest'
import { compileNativeStylesheet } from '../src/compiler'
import { createNativeStyleRuntime } from '../src/runtime'

const manifest = compileNativeStylesheet(`
  .flex { display: flex; }
  .items-center { align-items: center; }
  .px-4 { padding-inline: 16px; }
  .bg-blue-500 { background-color: #3b82f6; }
`, { classSet: ['flex', 'items-center', 'px-4', 'bg-blue-500'] })
const runtime = createNativeStyleRuntime(manifest)
const staticIds = [
  ...(manifest.staticLookup?.flex ?? []),
  ...(manifest.staticLookup?.['items-center'] ?? []),
  ...(manifest.staticLookup?.['px-4'] ?? []),
]

describe('React Native style paths', () => {
  bench('static StyleSheet lookup', () => {
    runtime.getStaticStyle(staticIds)
  })
  bench('dynamic tw cache hit', () => {
    runtime.tw('flex items-center px-4')
  })
  bench('dynamic tw cache miss', () => {
    runtime.tw(['flex', 'items-center', `px-4 bg-blue-500 ${Math.random()}`])
  })
})
