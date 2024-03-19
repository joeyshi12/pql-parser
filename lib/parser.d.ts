import { PQLSyntaxTree } from './types';
import { Lexer } from './lexer';
/**
 * Parser for Plot Query Language (PQL) queries
 */
export declare class Parser {
    private _lexer;
    private _currentToken;
    constructor(lexer: Lexer);
    /**
     * Parses the PQL query into a syntax tree
     * @returns The syntax tree representing the parsed PQL query
     */
    parse(): PQLSyntaxTree;
    private consumePlotClause;
    private consumeUsingClause;
    private consumeWhereClauseOptional;
    private consumeGroupByClauseOptional;
    private consumeUsingAttribute;
    private nextToken;
    private consumeToken;
}
