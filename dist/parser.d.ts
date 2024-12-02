import { PQLQuery } from './types';
import { Lexer } from './lexer';
/**
 * Parser for PQL queries
 */
export declare class Parser {
    private _lexer;
    private _currentToken;
    constructor(lexer: Lexer);
    /**
     * Parses the PQL query into a syntax tree
     * @returns AST of the PQL query
     */
    parse(): PQLQuery;
    private _consumePlotClause;
    private _consumePlotArgs;
    private _consumeColumn;
    private _consumeCondition;
    private _consumeConditionGroup;
    private _consumeComparison;
    private _consumeLimitAndOffsetClause;
    private _consumeToken;
    private _consumeComparisonValue;
}
