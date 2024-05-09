import { AggregationFunction, LimitAndOffset, PlotType, Token, TokenType, UsingAttribute } from './types';
import { Lexer } from './lexer';
import { PQLError } from './exceptions';
import { AndFilter, EqualFilter, GreaterThanFilter, GreaterThanOrEqualFilter, LessThanFilter, LessThanOrEqualFilter, NotEqualFilter, OrFilter, WhereFilter } from './filters';
import { PQLStatement } from './pqlStatement';

/**
 * Parser for Plot Query Language (PQL) queries
 */
export class Parser {
    private _lexer: Lexer;
    private _currentToken: Token;

    constructor(lexer: Lexer) {
        this._lexer = lexer;
        this._currentToken = this._lexer.nextToken();
    }

   /**
    * Parses the PQL query into a syntax tree
    * @returns PQL statement of the parsed PQL query
    */
    public parse(): PQLStatement {
        const plotType = this._consumePlotClause();
        const usingAttributes = this._consumeUsingClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        const limitAndOffset = this._consumeLimitAndOffsetClauseOptional();
        this._consumeTokenWithType("EOF");
        this._validateAttributes(usingAttributes, groupByColumn);
        return new PQLStatement(plotType, usingAttributes, whereFilter, groupByColumn, limitAndOffset);
    }

    private _validateAttributes(attributes: UsingAttribute[], groupByColumn?: string) {
        if (groupByColumn) {
            attributes.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== groupByColumn) {
                    throw new PQLError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        } else {
            attributes.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new PQLError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }

    private _consumePlotClause(): PlotType {
        const plotToken = this._consumeTokenWithType("KEYWORD");
        if (plotToken.value !== "PLOT") {
            throw new PQLError("Must begin query with PLOT");
        }
        return <PlotType>this._consumeTokenWithType("PLOT_TYPE").value;
    }

    private _consumeUsingClause(): UsingAttribute[] {
        const usingToken = this._consumeTokenWithType("KEYWORD");
        if (usingToken.value !== "USING") {
            throw new PQLError("Expected using clause");
        }

        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === "COMMA") {
                this._consumeTokenWithType("COMMA");
            } else {
                break;
            }
        }
        return attributes;
    }

    private _consumeWhereClauseOptional(): WhereFilter | undefined {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this._consumeTokenWithType("KEYWORD");
        return this._consumeWhereCondition();
    }

    private _consumeWhereCondition(): WhereFilter {
        const filters: WhereFilter[] = [];

        while (true) {
            const innerFilters = [this._consumeCondition()];
            while (this._currentToken.value === "AND") {
                this._consumeTokenWithType("LOGICAL_OPERATOR");
                innerFilters.push(this._consumeCondition());
            }
            const innerFilter = innerFilters.length === 1
                ? innerFilters[0]
                : new AndFilter(innerFilters);
            filters.push(innerFilter);
            if (this._currentToken.value !== "OR") {
                break;
            }
            this._advanceToken();
        }

        if (filters.length === 1) {
            return filters[0];
        }

        return new OrFilter(filters);
    }

    private _consumeCondition(): WhereFilter {
        if (this._currentToken.type === "IDENTIFIER") {
            return this._consumeComparison();
        }
        this._consumeTokenWithType("LPAREN");
        const condition = this._consumeWhereCondition();
        this._consumeTokenWithType("RPAREN");
        return condition;
    }

    private _consumeComparison(): WhereFilter {
        const column = this._consumeTokenWithType("IDENTIFIER").value;
        const comparisonOperator = this._consumeTokenWithType("COMPARISON_OPERATOR").value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new LessThanOrEqualFilter(column, value);
            case "=":
                return new EqualFilter(column, this._consumeComparisonValue());
            case "!=":
                return new NotEqualFilter(column, this._consumeComparisonValue());
            default:
                throw new PQLError(`Invalid comparison operator ${comparisonOperator}`)
        }
    }

    private _consumeGroupByClauseOptional(): string | undefined {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this._consumeTokenWithType("KEYWORD");
        return this._consumeTokenWithType("IDENTIFIER").value;
    }

    private _consumeLimitAndOffsetClauseOptional(): LimitAndOffset | undefined {
        if (this._currentToken.value !== "LIMIT") {
            return undefined;
        }
        this._consumeTokenWithType("KEYWORD");
        const limit = Number(this._consumeTokenWithType("NUMBER").value);
        if (this._currentToken.value.valueOf() !== "OFFSET") {
            return { limit, offset: 0 };
        }
        this._consumeTokenWithType("KEYWORD");
        const offset = Number(this._consumeTokenWithType("NUMBER").value);
        return { limit, offset };
    }

    private _consumeUsingAttribute(): UsingAttribute {
        let column: string | undefined = undefined;
        let aggregationFunction: AggregationFunction | undefined = undefined;

        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = <AggregationFunction>this._consumeTokenWithType("AGGREGATION_FUNCTION").value;
            this._consumeTokenWithType("LPAREN");
            if (aggregationFunction !== "COUNT") {
                column = this._consumeTokenWithType("IDENTIFIER").value;
            }
            this._consumeTokenWithType("RPAREN");
        } else {
            column = this._consumeTokenWithType("IDENTIFIER").value;
        }

        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenWithType("KEYWORD");
            displayName = this._consumeTokenWithType("IDENTIFIER").value;
        }

        return { column, displayName, aggregationFunction }
    }

    private _advanceToken(): Token {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }

    private _consumeTokenWithType(tokenType: TokenType): Token {
        const token = this._currentToken;
        if (token.type === tokenType) {
            this._currentToken = this._lexer.nextToken();
            return token;
        } else {
            throw new PQLError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`)
        }
    }

    private _consumeComparisonValue(): string | number | null {
        const token = this._advanceToken();
        switch (token.type) {
            case "STRING":
                return token.value;
            case "NUMBER":
                return Number(token.value);
            case "NULL":
                return null;
            default:
                throw new PQLError("Equal comparison allowed only for string, number, and null");
        }
    }
}

