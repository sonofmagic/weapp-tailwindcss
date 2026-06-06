import type { ChildNode, Result } from 'postcss';
import type { CalcNode } from '../parser';

const order = {
  '*': 0,
  '/': 0,
  '+': 1,
  '-': 1,
} as const;

interface StringifierOptions {
  precision: number | false;
  warnWhenCannotResolve: boolean;
}

function round(value: number, prec: number | false): number {
  if (prec !== false) {
    const precision = Math.pow(10, prec);
    return Math.round(value * precision) / precision;
  }
  return value;
}

function stringify(node: CalcNode, prec: number | false): string {
  switch (node.type) {
    case 'MathExpression': {
      const { left, right, operator: op } = node;
      let str = '';
      if (left.type === 'MathExpression' && order[op] < order[left.operator]) {
        str += `(${stringify(left, prec)})`;
      } else if (left.type === 'CalcKeyword') {
        str += left.value;
      } else {
        str += stringify(left, prec);
      }

      str += order[op] ? ` ${node.operator} ` : node.operator;

      if (
        right.type === 'MathExpression' &&
        order[op] < order[right.operator]
      ) {
        str += `(${stringify(right, prec)})`;
      } else if (right.type === 'CalcKeyword') {
        str += right.value;
      } else {
        str += stringify(right, prec);
      }

      return str;
    }
    case 'Number':
      return round(node.value, prec).toString();
    case 'Function':
      return node.value.toString();
    case 'ParenthesizedExpression':
      return `(${stringify(node.content, prec)})`;
    case 'CalcKeyword':
      return node.value;
    default:
      return round(node.value, prec) + node.unit;
  }
}

export default function stringifyCalc(
  calc: string,
  node: CalcNode,
  originalValue: string,
  options: StringifierOptions,
  result: Result,
  item: ChildNode
): string {
  let str = stringify(node, options.precision);

  const shouldPrintCalc =
    node.type === 'MathExpression' ||
    node.type === 'Function' ||
    node.type === 'ParenthesizedExpression' ||
    node.type === 'CalcKeyword';

  if (shouldPrintCalc) {
    // if calc expression couldn't be resolved to a single value, re-wrap it as
    // a calc()
    if (node.type === 'ParenthesizedExpression') {
      str = `${calc}${str}`;
    } else {
      str = `${calc}(${str})`;
    }

    // if the warnWhenCannotResolve option is on, inform the user that the calc
    // expression could not be resolved to a single value
    if (options.warnWhenCannotResolve) {
      result.warn('Could not reduce expression: ' + originalValue, {
        plugin: 'postcss-calc',
        node: item,
      });
    }
  }
  return str;
}
