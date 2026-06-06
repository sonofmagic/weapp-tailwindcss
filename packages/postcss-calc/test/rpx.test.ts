'use strict';
import { test, assert } from 'vitest';

import postcss from 'postcss';

import reduceCalc from '../src/index.ts';
import type { PostCssCalcOptions } from '../src/index.ts';

const postcssOpts = { from: undefined };

function testValue(fixture: string, expected: string, opts: PostCssCalcOptions = {}) {
  fixture = `foo{bar:${fixture}}`;
  expected = `foo{bar:${expected}}`;

  return async () => {
    const result = await postcss(reduceCalc(opts)).process(
      fixture,
      postcssOpts
    );
    assert.strictEqual(result.css, expected);
  };
}

function testThrows(fixture: string, expected: string, warning: string, opts: PostCssCalcOptions = {}) {
  fixture = `foo{bar:${fixture}}`;
  expected = `foo{bar:${expected}}`;

  return async () => {
    const result = await postcss(reduceCalc(opts)).process(
      fixture,
      postcssOpts
    );
    const warnings = result.warnings();
    assert.strictEqual(result.css, expected);
    assert.strictEqual(warnings[0].text, warning);
  };
}

test('should reduce simple calc (1)', testValue('calc(1rpx + 1rpx)', '2rpx'));

test(
  'should reduce simple calc (2)',
  testValue('calc(1px + 1px);baz:calc(2px+3px)', '2px;baz:5px')
);

test('should reduce simple calc (3)', testValue('calc(1rpx * 1.5)', '1.5rpx'));

test(
  'should keep rpx isolated from physical length conversions',
  testThrows(
    'calc(10rpx + 1px)',
    'calc(10rpx + 1px)',
    'Cannot convert from px to rpx'
  )
);

test('should reduce simple calc (4)', testValue('calc(3em - 1em)', '2em'));

test('should reduce simple calc (5', testValue('calc(2ex / 2)', '1ex'));

test(
  'should reduce simple calc (6)',
  testValue('calc(50px - (20px - 30px))', '60px')
);

test(
  'should reduce simple calc (7)',
  testValue('calc(100px - (100px - 100%))', '100%')
);

test(
  'should reduce simple calc (8)',
  testValue('calc(100px + (100px - 100%))', 'calc(200px - 100%)')
);

test(
  'should reduce additions and subtractions (1)',
  testValue('calc(100% - 10px + 20px)', 'calc(100% + 10px)')
);

test(
  'should reduce additions and subtractions (2)',
  testValue('calc(100% + 10px - 20px)', 'calc(100% - 10px)')
);

test(
  'should reduce additions and subtractions (3)',
  testValue('calc(1px - (2em + 3%))', 'calc(1px - 2em - 3%)')
);

test(
  'should reduce additions and subtractions (4)',
  testValue('calc((100vw - 50em) / 2)', 'calc(50vw - 25em)')
);

test(
  'should reduce additions and subtractions (5)',
  testValue('calc(10px - (100vw - 50em) / 2)', 'calc(10px - 50vw + 25em)')
);

test(
  'should reduce additions and subtractions (6)',
  testValue('calc(1px - (2em + 4vh + 3%))', 'calc(1px - 2em - 4vh - 3%)')
);
