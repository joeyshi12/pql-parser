import { Lexer } from './lexer';
import { PQLStatement } from './pqlStatement';
/**
 * Parser for Plot Query Language (PQL) queries
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
    private _consumeUsingClause;
    private _consumeWhereClauseOptional;
    private _consumeWhereCondition;
    private _consumeCondition;
    private _consumeComparison;
    private _consumeGroupByClauseOptional;
    private _consumeLimitAndOffsetClauseOptional;
    private _consumeUsingAttribute;
    private _advanceToken;
    private _consumeTokenWithType;
    private _consumeComparisonValue;
}
