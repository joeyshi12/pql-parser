import { PQLSyntaxTree } from './types';
import { Lexer } from './lexer';
export declare class Parser {
    private _lexer;
    private _currentToken;
    constructor(lexer: Lexer);
    parse(): PQLSyntaxTree;
    private consumePlotClause;
    private consumeUsingClause;
    private consumeWhereClauseOptional;
    private consumeUsingAttribute;
    private nextToken;
    private consumeToken;
}
