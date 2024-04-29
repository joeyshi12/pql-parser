import { AggregationFunction, PlotType, Token, TokenType, UsingAttribute } from './types';
import { Lexer } from './lexer';
import { PQLError } from './exceptions';
import { EqualFilter, GreaterThanFilter, GreaterThanOrEqualFilter, LessThanFilter, LessThanOrEqualFilter, WhereFilter } from './filters';
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
        this._consumeTokenType("EOF");
        this._validateAttributes(usingAttributes, groupByColumn);
        return new PQLStatement(plotType, usingAttributes, whereFilter, groupByColumn);
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
        const plotToken = this._consumeTokenType("KEYWORD");
        if (plotToken.value !== "PLOT") {
            throw new PQLError("Must begin query with PLOT");
        }
        return <PlotType>this._consumeTokenType("PLOT_TYPE").value;
    }

    private _consumeUsingClause(): UsingAttribute[] {
        const usingToken = this._consumeTokenType("KEYWORD");
        if (usingToken.value !== "USING") {
            throw new PQLError("Expected using clause");
        }

        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === "COMMA") {
                this._consumeTokenType("COMMA");
            } else {
                break;
            }
        }
        return attributes;
    }

    // TODO: handle chained and nested where clauses
    private _consumeWhereClauseOptional(): WhereFilter | undefined {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this._consumeTokenType("KEYWORD");
        const column = this._consumeTokenType("IDENTIFIER").value;
        const comparisonOperator = this._consumeTokenType("COMPARISON_OPERATOR").value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new LessThanOrEqualFilter(column, value);
            case "=":
                const token = this._consumeToken();
                switch (token.type) {
                    case "STRING":
                        return new EqualFilter(column, token.value);
                    case "NUMBER":
                        return new EqualFilter(column, Number(token.value));
                    case "NULL":
                        return new EqualFilter(column, null);
                    default:
                        throw new PQLError("Equal comparison allowed only for string, number, and null");
                }
            default:
                throw new PQLError(`Invalid comparison operator ${comparisonOperator}`)
        }
    }

    private _consumeGroupByClauseOptional(): string | undefined {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this._consumeTokenType("KEYWORD");
        return this._consumeTokenType("IDENTIFIER").value;
    }

    private _consumeUsingAttribute(): UsingAttribute {
        let column: string | undefined = undefined;
        let aggregationFunction: AggregationFunction | undefined = undefined;

        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = <AggregationFunction>this._consumeTokenType("AGGREGATION_FUNCTION").value;
            this._consumeTokenType("LPAREN");
            if (this._currentToken.type.valueOf() === "IDENTIFIER".valueOf()) {
                column = this._consumeTokenType("IDENTIFIER").value;
            } else if (aggregationFunction !== "COUNT") {
                throw new PQLError(`Missing identifier in aggregation function ${aggregationFunction}`);
            }
            this._consumeTokenType("RPAREN");
        } else {
            column = this._consumeTokenType("IDENTIFIER").value;
        }

        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenType("KEYWORD");
            displayName = this._consumeTokenType("IDENTIFIER").value;
        }

        return { column, displayName, aggregationFunction }
    }

    private _consumeToken(): Token {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }

    private _consumeTokenType(tokenType: TokenType): Token {
        const token = this._currentToken;
        if (token.type === tokenType) {
            this._currentToken = this._lexer.nextToken();
            return token;
        } else {
            throw new PQLError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`)
        }
    }
}

