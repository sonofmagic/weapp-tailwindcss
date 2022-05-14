import { templeteReplacer } from '@/wxml/index'
describe('templeteReplacer', () => {
  it('isStringLiteral', () => {
    const testCase = "{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}"

    const result = templeteReplacer(testCase)

    expect(result).toBe("{{['som-node__label','data-v-59229c4a','som-org__text-'+(node.align||''),node.active||collapsed?'som-node__label-active':'',d]}}")
    expect(result).toMatchSnapshot()
  })

  it('isConditionalExpression', () => {
    const testCase = "{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}"
    const result = templeteReplacer(testCase)
    expect(result).toBe("{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-_l__h_fafa00_r_']}}")
    expect(result).toMatchSnapshot()
  })

  it('nest ', () => {
    const testCase =
      "{{[flag?'bg-red-900':'bg-[#fafa00]',classObject,[(flag===true)?'bg-[#fafa00]':'',(true)?'text-sm':''],flag?flag===false?'bg-red-900':'bg-[#000]':'bg-[#fafa00]']}}"

    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "{{[flag?'bg-red-900':'bg-_l__h_fafa00_r_',classObject,[flag===true?'bg-_l__h_fafa00_r_':'',true?'text-sm':''],flag?flag===false?'bg-red-900':'bg-_l__h_000_r_':'bg-_l__h_fafa00_r_']}}"
    )
    expect(result).toMatchSnapshot()
  })

  it('sm:text-3xl dark:text-sky-400', () => {
    const testCase = 'sm:text-3xl dark:text-slate-200 bg-[#ffffaa]'
    const result = templeteReplacer(testCase)
    expect(result).toBe('sm_c_text-3xl dark_c_text-slate-200 bg-_l__h_ffffaa_r_')
    expect(result).toMatchSnapshot()
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

  it('variables with multiple literal', async () => {
    // eslint-disable-next-line quotes
    const testCase = `border-0 icon h-10 w-10 mx-auto {{active=='home'? 'icon-home-selected' : 'icon-home'}} {{}} {{ }} w-[20px] {{flag=='p-[20px]'? 'p-[20px]' : 'm-[20px]'}} h-[20px]`
    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "border-0 icon h-10 w-10 mx-auto {{active=='home'?'icon-home-selected':'icon-home'}}   w-_l_20px_r_ {{flag=='p-_l_20px_r_'?'p-_l_20px_r_':'m-_l_20px_r_'}} h-_l_20px_r_"
    )
  })

  it('variables with multiple literal(2)', () => {
    // eslint-disable-next-line quotes
    const testCase = `border-0 icon h-10 w-10 mx-auto {{active=='home'? 'icon-home-selected' : 'icon-home'}} {{b}} {{ a==='cc' }} w-[20px] {{flag=='p-[20px]'? 'p-[20px]' : 'm-[20px]'}}`
    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "border-0 icon h-10 w-10 mx-auto {{active=='home'?'icon-home-selected':'icon-home'}} {{b}} {{a==='cc'}} w-_l_20px_r_ {{flag=='p-_l_20px_r_'?'p-_l_20px_r_':'m-_l_20px_r_'}}"
    )
  })

  it('for toutiao str add not array', () => {
    const testCase = "{{('!font-bold') + ' ' + '!text-[#990000]' + ' ' + 'data-v-1badc801' + ' ' + 'text-2xl' + ' ' + b}}" // '{{\'font-bold\'+\'\'+\'text-blue-500\'+\'\'+\'data-v-1badc801\'+\'\'+\'text-2xl\'+\'\'+b}}'

    const result = templeteReplacer(testCase)
    expect(result).toBe("{{'_i_font-bold'+' '+'_i_text-_l__h_990000_r_'+' '+'data-v-1badc801'+' '+'text-2xl'+' '+b}}")
  })

  it('utils.bem()', () => {
    const testCase =
      "custom-class {{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? 'van-hairline--surround' : '' }}"

    // const case3 = '{{ utils.bem(\'button\', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }}'
    const result = templeteReplacer(testCase)
    expect(result).toBe(
      "custom-class {{utils.bem('button',[type,size,{block,round,plain,square,loading,disabled,hairline,unclickable:disabled||loading}])}} {{hairline?'van-hairline--surround':''}}"
    )
  })
})
