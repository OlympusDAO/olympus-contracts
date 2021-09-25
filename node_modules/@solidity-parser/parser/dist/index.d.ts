import { Token, ParseOptions, TokenizeOptions } from './types';
import { AST } from './ast-types';
interface ParserErrorItem {
    message: string;
    line: number;
    column: number;
}
export declare class ParserError extends Error {
    errors: ParserErrorItem[];
    constructor(args: {
        errors: ParserErrorItem[];
    });
}
export declare function tokenize(input: string, options?: TokenizeOptions): Token[];
export declare function parse(input: string, options?: ParseOptions): AST;
export declare function visit(node: any, visitor: any): void;
export {};
