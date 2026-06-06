import { describe, it, expect } from 'vitest'
import postcss from 'postcss';
import reduceCalc from '../src/index.js'

const postcssOpts = { from: undefined };
function testValue(fixture: string, expected: string, opts = {}) {
  return async () => {
    const result = await postcss(reduceCalc(opts)).process(
      fixture,
      postcssOpts
    );
    expect(result.css).toEqual(expected);
  };
}


describe('ignore', () => {
  it('--nutui-color-primary case 0', async () => {
    await testValue(
      'foo{background:linear-gradient(90deg,var(--nutui-color-primary-stop-1,#ff475d) 0,var(--nutui-color-primary-stop-2,#ff0f23) 100%)}',
      'foo{background:linear-gradient(90deg,var(--nutui-color-primary-stop-1,#ff475d) 0,var(--nutui-color-primary-stop-2,#ff0f23) 100%)}')()
  });

  it('--nutui-color-primary case 1', async () => {
    await testValue(
      'foo{--nutui-color-primary-stop-1:#ffffff;background:linear-gradient(90deg,var(--nutui-color-primary-stop-1,#ff475d) 0,var(--nutui-color-primary-stop-2,#ff0f23) 100%)}',
      'foo{--nutui-color-primary-stop-1:#ffffff;background:linear-gradient(90deg,var(--nutui-color-primary-stop-1,#ff475d) 0,var(--nutui-color-primary-stop-2,#ff0f23) 100%)}')()
  });
});
