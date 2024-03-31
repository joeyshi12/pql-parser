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
    private _validateSyntaxTree;
    private _consumePlotClause;
    private _consumeUsingClause;
    private _consumeWhereClauseOptional;
    private _consumeGroupByClauseOptional;
    private _consumeUsingAttribute;
    private _consumeToken;
    private _consumeTokenType;
}
