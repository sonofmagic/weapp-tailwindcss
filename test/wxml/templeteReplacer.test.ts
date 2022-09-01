import { templeteReplacer } from '@/wxml/index'
import ClassGenerator from '@/mangle/classGenerator'
const testTable = [
  [
    {},
    {
      label: '[mangle]',
      mangle: true
    }
  ]
]
describe('templeteReplacer', () => {
  let classGenerator:ClassGenerator
  beforeEach(() => {
    classGenerator = new ClassGenerator()
  })
  it.each(testTable)('$label isStringLiteral', ({ label, mangle }) => {
    const testCase = "{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}"

    const result = templeteReplacer(testCase, {
      mangle,
      classGenerator
    })

    expect(result).toBe("{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}")
    expect(result).toMatchSnapshot()
  })

  it('isConditionalExpression', () => {
    const testCase = "{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}"
    const result = templeteReplacer(testCase)
    expect(result).toBe("{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-_bl__h_fafa00_br_']}}")
    expect(result).toMatchSnapshot()
  })

  it('nest ', () => {
    const testCase =
      "{{[flag?'bg-red-900':'bg-[#fafa00]',classObject,[(flag===true)?'bg-[#fafa00]':'',(true)?'text-sm':''],flag?flag===false?'bg-red-900':'bg-[#000]':'bg-[#fafa00]']}}"

    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "{{[flag?'bg-red-900':'bg-_bl__h_fafa00_br_',classObject,[flag===true?'bg-_bl__h_fafa00_br_':'',true?'text-sm':''],flag?flag===false?'bg-red-900':'bg-_bl__h_000_br_':'bg-_bl__h_fafa00_br_']}}"
    )
    expect(result).toMatchSnapshot()
  })

  it('sm:text-3xl dark:text-sky-400', () => {
    const testCase = 'sm:text-3xl dark:text-slate-200 bg-[#ffffaa]'
    const result = templeteReplacer(testCase)
    expect(result).toBe('sm_c_text-3xl dark_c_text-slate-200 bg-_bl__h_ffffaa_br_')
    expect(result).toMatchSnapshot()
  })

  it('[mangle] sm:text-3xl dark:text-sky-400', () => {
    const testCase = 'sm:text-3xl dark:text-slate-200 bg-[#ffffaa]'
    const result = templeteReplacer(testCase, {
      mangle: true,
      classGenerator
    })

    expect(result).toBe('a b c')
    expect(classGenerator.newClassSize).toBe(result.split(' ').length)
  })

  it('\\r\\n replace test', async () => {
    const testCase = `
    bg-white
    rounded-full
    w-10
    h-10
    flex
    justify-center
    items-center
    pointer-events-auto
  `
    const result = templeteReplacer(testCase)
    expect(result).toBe('    bg-white    rounded-full    w-10    h-10    flex    justify-center    items-center    pointer-events-auto  ')
  })

  it('[mangle] \\r\\n replace test', async () => {
    const testCase = `
    bg-white
    rounded-full
    w-10
    h-10
    flex
    justify-center
    items-center
    pointer-events-auto
  `
    const result = templeteReplacer(testCase, {
      mangle: true,
      classGenerator
    })
    expect(result).toBe('a b c d e f g h')
    expect(classGenerator.newClassSize).toBe(result.split(' ').length)
  })

  it('\\r\\n replace test with var', async () => {
    const testCase = `{{[
      'flex',
      'items-center',
      'justify-center',
      'h-_l_100px_r_',
      'w-_l_100px_r_',
      'rounded-_l_40px_r_',
      'bg-_l__h_123456_r_',
      'bg-opacity-_l_0-dot-54_r_',
      'text-_l__h_ffffff_r_',
      'data-v-1badc801',
      'text-_l__h_123456_r_',
      b]}}`
    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "{{['flex','items-center','justify-center','h-_l_100px_r_','w-_l_100px_r_','rounded-_l_40px_r_','bg-_l__h_123456_r_','bg-opacity-_l_0-dot-54_r_','text-_l__h_ffffff_r_','data-v-1badc801','text-_l__h_123456_r_',b]}}"
    )
  })

  it('[mangle] \\r\\n replace test with var', async () => {
    const testCase = `{{[
      'flex',
      'items-center',
      'justify-center',
      'h-_l_100px_r_',
      'w-_l_100px_r_',
      'rounded-_l_40px_r_',
      'bg-_l__h_123456_r_',
      'bg-opacity-_l_0-dot-54_r_',
      'text-_l__h_ffffff_r_',
      'data-v-1badc801',
      'text-_l__h_123456_r_',
      b]}}`
    const result = templeteReplacer(testCase, {
      mangle: true,
      classGenerator
    })
    expect(result).toBe(
      "{{['flex','items-center','justify-center','h-_l_100px_r_','w-_l_100px_r_','rounded-_l_40px_r_','bg-_l__h_123456_r_','bg-opacity-_l_0-dot-54_r_','text-_l__h_ffffff_r_','data-v-1badc801','text-_l__h_123456_r_',b]}}"
    )
  })

  it('variables with multiple literal', async () => {
    // eslint-disable-next-line quotes
    const testCase = `border-0 icon h-10 w-10 mx-auto {{active=='home'? 'icon-home-selected' : 'icon-home'}} {{}} {{ }} w-[20px] {{flag=='p-[20px]'? 'p-[20px]' : 'm-[20px]'}} h-[20px]`
    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "border-0 icon h-10 w-10 mx-auto {{active=='home'?'icon-home-selected':'icon-home'}}   w-_bl_20px_br_ {{flag=='p-_bl_20px_br_'?'p-_bl_20px_br_':'m-_bl_20px_br_'}} h-_bl_20px_br_"
    )
  })

  it('[mangle] variables with multiple literal', async () => {
    // eslint-disable-next-line quotes
    const testCase = `border-0 icon h-10 w-10 mx-auto {{active=='home'? 'icon-home-selected' : 'icon-home'}} {{}} {{ }} w-[20px] {{flag=='p-[20px]'? 'p-[20px]' : 'm-[20px]'}} h-[20px]`
    const result = templeteReplacer(testCase, {
      mangle: true,
      classGenerator
    })
    expect(result).toBe(
      "border-0 icon h-10 w-10 mx-auto {{active=='home'?'icon-home-selected':'icon-home'}}   w-_bl_20px_br_ {{flag=='p-_bl_20px_br_'?'p-_bl_20px_br_':'m-_bl_20px_br_'}} h-_bl_20px_br_"
    )
  })

  it.each(testTable)('variables with multiple literal(2)', ({ mangle }) => {
    // eslint-disable-next-line quotes
    const testCase = `border-0 icon h-10 w-10 mx-auto {{active=='home'? 'icon-home-selected' : 'icon-home'}} {{b}} {{ a==='cc' }} w-[20px] {{flag=='p-[20px]'? 'p-[20px]' : 'm-[20px]'}}`
    const result = templeteReplacer(testCase, { mangle })
    expect(result).toBe(
      "border-0 icon h-10 w-10 mx-auto {{active=='home'?'icon-home-selected':'icon-home'}} {{b}} {{a==='cc'}} w-_bl_20px_br_ {{flag=='p-_bl_20px_br_'?'p-_bl_20px_br_':'m-_bl_20px_br_'}}"
    )
  })

  it.each(testTable)('%label for toutiao str add not array', ({ mangle }) => {
    const testCase = "{{('!font-bold') + ' ' + '!text-[#990000]' + ' ' + 'data-v-1badc801' + ' ' + 'text-2xl' + ' ' + b}}" // '{{\'font-bold\'+\'\'+\'text-blue-500\'+\'\'+\'data-v-1badc801\'+\'\'+\'text-2xl\'+\'\'+b}}'

    const result = templeteReplacer(testCase, { mangle })
    expect(result).toBe("{{'_i_font-bold'+' '+'_i_text-_bl__h_990000_br_'+' '+'data-v-1badc801'+' '+'text-2xl'+' '+b}}")
  })

  it.each(testTable)('%label utils.bem()', ({ mangle }) => {
    const testCase =
      "custom-class {{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? 'van-hairline--surround' : '' }}"

    const result = templeteReplacer(testCase, { mangle })
    expect(result).toBe(
      "custom-class {{utils.bem('button',[type,size,{block,round,plain,square,loading,disabled,hairline,unclickable:disabled||loading}])}} {{hairline?'van-hairline--surround':''}}"
    )
  })

  // .shadow-\[0px_2px_11px_0px_rgba\(0\2c 0\2c 0\2c 0\.4\)\]
  it('arbitrary shadow values 0', () => {
    // 逗号 comma 的原因
    const testCase = 'shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)]'

    const result = templeteReplacer(testCase)
    expect(result).toBe('shadow-_bl_0px_2px_11px_0px_rgba_pl_0_co_0_co_0_co_0_d_4_qr__br_')
  })

  // .shadow-\[0px_2px_11px_0px_\#0000000a\]
  it('arbitrary shadow values 1', () => {
    const testCase = 'shadow-[0px_2px_11px_0px_#00000a]'
    const result = templeteReplacer(testCase)
    expect(result).toBe('shadow-_bl_0px_2px_11px_0px__h_00000a_br_')
  })

  it("arbitrary before:content-['hello']", () => {
    const testCase = "before:content-['hello']"
    const result = templeteReplacer(testCase)
    expect(result).toBe('before_c_content-_bl__q_hello_q__br_')
  })
})
