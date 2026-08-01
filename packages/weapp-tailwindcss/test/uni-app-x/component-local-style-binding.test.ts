import { getCompilerContext } from '@/context'
import { transformUVue } from '@/uni-app-x'

function transformComponent(code: string, runtimeSet: Set<string>, id = 'binding-probe.uvue') {
  const { jsHandler } = getCompilerContext({ uniAppX: true })
  return transformUVue(
    code,
    `/src/components/${id}`,
    jsHandler,
    runtimeSet,
    { enableComponentLocalStyle: true },
  )
}

describe('uni-app-x component local style bindings', () => {
  it('does not treat runtime style property names as component-local classes', () => {
    const code = [
      '<template><view class="up-line" :style="[lineStyle]" /></template>',
      '<script lang="uts">',
      'const lineStyle = () => {',
      '  const style = {}',
      "  style['transform'] = 'scaleY(0.5)'",
      '  return style',
      '}',
      '</script>',
      '<style lang="scss" scoped>',
      '@import "../../libs/css/components.scss";',
      '.up-line {}',
      '</style>',
    ].join('\n')

    const result = transformComponent(code, new Set(['transform']), 'up-line/up-line.uvue')

    expect(result?.code).toContain("style['transform'] = 'scaleY(0.5)'")
    expect(result?.code).not.toContain('@apply transform;')
  })

  it('rewrites a real transform class without rewriting a same-named style property', () => {
    const code = [
      '<template><view :class="activeClass" /></template>',
      '<script setup lang="ts">',
      "const activeClass = 'transform'",
      "const style = { transform: 'scaleY(0.5)' }",
      '</script>',
    ].join('\n')

    const result = transformComponent(code, new Set(['transform']), 'transform-probe/transform-probe.uvue')

    expect(result?.code).toMatch(/const activeClass = ['"]wtu-[\w-]+['"]/)
    expect(result?.code).toContain("transform: 'scaleY(0.5)'")
    expect(result?.code.match(/@apply transform;/g)).toHaveLength(1)
  })

  it('does not rewrite shadowed bindings or non-referenced member property names', () => {
    const code = [
      '<template><view :class="state.activeClass" /></template>',
      '<script setup lang="ts">',
      "const state = { activeClass: 'bg-red-500' }",
      'function createStyle() {',
      "  const state = { activeClass: 'transform' }",
      "  return { transform: 'scaleY(0.5)', state }",
      '}',
      '</script>',
    ].join('\n')

    const result = transformComponent(
      code,
      new Set(['bg-red-500', 'transform']),
      'binding-scope-probe/binding-scope-probe.uvue',
    )

    expect(result?.code).toMatch(/const state = \{ activeClass: ['"]wtu-[\w-]+['"] \}/)
    expect(result?.code).toContain("const state = { activeClass: 'transform' }")
    expect(result?.code).toContain("transform: 'scaleY(0.5)'")
    expect(result?.code).toContain('@apply bg-red-500;')
    expect(result?.code).not.toContain('@apply transform;')
  })

  it('rewrites Options API data and computed class bindings only', () => {
    const code = [
      '<template><view :class="activeClass"><text :class="extra" /></view></template>',
      '<script lang="uts">',
      'export default {',
      '  data() {',
      "    return { extra: 'text-white', style: { activeClass: 'transform' } }",
      '  },',
      '  computed: {',
      "    activeClass() { return 'bg-red-500' }",
      '  },',
      '}',
      '</script>',
    ].join('\n')

    const result = transformComponent(
      code,
      new Set(['bg-red-500', 'text-white', 'transform']),
      'options-binding-probe/options-binding-probe.uvue',
    )

    expect(result?.code).toMatch(/extra: ['"]wtu-[\w-]+['"]/)
    expect(result?.code).toMatch(/activeClass\(\) \{ return ['"]wtu-[\w-]+['"] \}/)
    expect(result?.code).toContain("style: { activeClass: 'transform' }")
    expect(result?.code).toContain('@apply bg-red-500;')
    expect(result?.code).toContain('@apply text-white;')
    expect(result?.code).not.toContain('@apply transform;')
  })
})
