import antlr4 from 'antlr4';
import { ParseOptions } from './types';
import { BaseASTNode } from './ast-types';
declare type Ctx = any;
declare class ASTBuilder extends antlr4.tree.ParseTreeVisitor {
    options: ParseOptions;
    constructor(options: ParseOptions);
    _loc(ctx: Ctx): {
        loc: {
            start: {
                line: any;
                column: any;
            };
            end: {
                line: any;
                column: any;
            };
        };
    };
    _range(ctx: Ctx): {
        range: any[];
    };
    meta(ctx: Ctx): any;
    createNode(obj: any, ctx: any): any;
    visit(ctx: Ctx): BaseASTNode | BaseASTNode[] | null;
}
export default ASTBuilder;
