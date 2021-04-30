declare module 'hot-formula-parser' {
  export interface ParseResult {
    error: string | null;
    result: number | null;
  }
  export class Parser {
    parse(formula: string): ParseResult;
    setVariable(key: string, v: number | string): void;
  }
}
