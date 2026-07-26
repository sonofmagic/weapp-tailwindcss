import { transformSync } from '@babel/core'
import babelPlugin from '@/babel'

describe('React Native Babel plugin', () => {
  it('converts static className and merges an existing style prop', () => {
    const result = transformSync('<View className="flex px-4" style={props.style} />', {
      filename: 'Screen.tsx',
      plugins: [[babelPlugin, { classNameSet: ['flex', 'px-4'] }]],
      parserOpts: { plugins: ['jsx', 'typescript'] },
      configFile: false,
      babelrc: false,
    })
    expect(result?.code).toContain('import')
    expect(result?.code).toContain('_twStatic(["flex", "px-4"])')
    expect(result?.code).toContain('_twCompose(_twStatic(["flex", "px-4"]), props.style)')
    expect(result?.code).not.toContain('_tw("flex px-4")')
    expect(result?.code).not.toContain('className')
  })

  it('leaves a static className alone when a token is outside the exact set', () => {
    const result = transformSync('<View className="flex unknown-token" />', {
      filename: 'Screen.tsx',
      plugins: [[babelPlugin, { classNameSet: ['flex'] }]],
      parserOpts: { plugins: ['jsx', 'typescript'] },
      configFile: false,
      babelrc: false,
    })
    expect(result?.code).toContain('className="flex unknown-token"')
    expect(result?.code).not.toContain('@weapp-tailwindcss/react-native/runtime')
  })

  it('converts dynamic expressions through the runtime helper', () => {
    const result = transformSync('<View className={condition ? "text-white" : "text-black"} />', {
      filename: 'Screen.tsx',
      plugins: [[babelPlugin, { classNameSet: ['text-white', 'text-black'] }]],
      parserOpts: { plugins: ['jsx', 'typescript'] },
      configFile: false,
      babelrc: false,
    })
    expect(result?.code).toContain('_tw(condition ? "text-white" : "text-black")')
    expect(result?.code).not.toContain('className')
  })

  it('converts React.createElement props and skips dependencies', () => {
    const result = transformSync('React.createElement(View, { className: "flex", style: props.style })', {
      filename: 'Screen.tsx',
      plugins: [[babelPlugin, { classNameSet: ['flex'] }]],
      parserOpts: { plugins: ['jsx', 'typescript'] },
      configFile: false,
      babelrc: false,
    })
    expect(result?.code).toContain('style: _twCompose(_twStatic(["flex"]), props.style)')
    expect(result?.code).not.toContain('className')

    const dependency = transformSync('<View className="flex" />', {
      filename: '/project/node_modules/library/index.tsx',
      plugins: [[babelPlugin, { classNameSet: ['flex'] }]],
      parserOpts: { plugins: ['jsx', 'typescript'] },
      configFile: false,
      babelrc: false,
    })
    expect(dependency?.code).toContain('className="flex"')
  })
})
