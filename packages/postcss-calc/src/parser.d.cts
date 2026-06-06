import type { Parser } from './parser';

declare const parserModule: {
  parser: Parser;
  Parser: new () => Parser;
  parse: Parser['parse'];
};

export default parserModule;
