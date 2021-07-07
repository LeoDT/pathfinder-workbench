declare module 'hot-formula-parser' {
  export const ERROR = 'ERROR';
  export const ERROR_DIV_ZERO = 'DIV/0';
  export const ERROR_NAME = 'NAME';
  export const ERROR_NOT_AVAILABLE = 'N/A';
  export const ERROR_NULL = 'NULL';
  export const ERROR_NUM = 'NUM';
  export const ERROR_REF = 'REF';
  export const ERROR_VALUE = 'VALUE';

  export function error(type: string): string;

  export interface ParseResult {
    error: string | null;
    result: number | boolean | null;
  }

  export class Parser {
    parse(formula: string): ParseResult;
    setVariable(key: string, v: number | string | boolean): void;
    setFunction(
      key: string,
      func: (args: Array<number | string | boolean>) => number | string | boolean
    ): void;
  }
}

declare module 'prettier/esm/standalone' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v: any;
  export default v;
}
declare module 'prettier/esm/parser-html' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v: any;
  export default v;
}
