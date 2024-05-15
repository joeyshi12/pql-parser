import { Lexer } from './lexer';
import { PQLStatement } from './pqlStatement';
/**
 * Parser for PQL queries
 */
export declare class Parser {
    private _lexer;
    private _currentToken;
    constructor(lexer: Lexer);
    /**
     * Parses the PQL query into a syntax tree
     * @returns PQL statement of the parsed PQL query
     */
    parse(): PQLStatement;
    private _validateAttributes;
    private _consumePlotClause;
    private _consumePlotColumn;
    private _consumeWhereClauseOptional;
    private _consumeCondition;
    private _consumeConditionGroup;
    private _consumeComparison;
    private _consumeGroupByClauseOptional;
    private _consumeLimitAndOffsetClauseOptional;
    private _consumeToken;
    private _consumeComparisonValue;
}
