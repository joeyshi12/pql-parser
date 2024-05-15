import { AggregationFunction, LimitAndOffset, PlotType, Token, TokenType, PlotColumn, PlotCall } from './types';
import { Lexer } from './lexer';
import { PQLError } from './exceptions';
import { AndFilter, EqualFilter, GreaterThanFilter, GreaterThanOrEqualFilter, LessThanFilter, LessThanOrEqualFilter, NotEqualFilter, OrFilter, WhereFilter } from './filters';
import { PQLStatement } from './pqlStatement';

/**
 * Parser for PQL queries
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
        const plotCall = this._consumePlotClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        const limitAndOffset = this._consumeLimitAndOffsetClauseOptional();
        this._consumeToken("EOF");
        this._validateAttributes(plotCall, groupByColumn);
        return new PQLStatement(plotCall, whereFilter, groupByColumn, limitAndOffset);
    }

    private _validateAttributes(plotCall: PlotCall, groupByColumn?: string) {
        if (groupByColumn) {
            plotCall.args.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== groupByColumn) {
                    throw new PQLError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        } else {
            plotCall.args.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new PQLError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }

    private _consumePlotClause(): PlotCall {
        this._consumeToken("KEYWORD", "PLOT");
        const plotType = <PlotType>this._consumeToken("PLOT_TYPE").value;
        this._consumeToken("LPAREN");
        const args: Map<string, PlotColumn> = new Map();
        switch (plotType) {
            case "BAR":
                args.set("categories", this._consumePlotColumn());
                this._consumeToken("COMMA");
                args.set("values", this._consumePlotColumn());
                break;
            case "LINE":
            case "SCATTER":
                args.set("x", this._consumePlotColumn());
                this._consumeToken("COMMA");
                args.set("y", this._consumePlotColumn());
                break;
            default:
                throw new PQLError(`Invalid plot type ${plotType}`);
        }
        while (this._currentToken.type === "COMMA") {
            this._consumeToken("COMMA");
            const identifierToken = this._consumeToken("IDENTIFIER");
            this._consumeToken("COMPARISON_OPERATOR", "=");
            const plotColumn = this._consumePlotColumn();
            args.set(identifierToken.value, plotColumn);
        }
        this._consumeToken("RPAREN");
        return { plotType, args };
    }

    private _consumePlotColumn(): PlotColumn {
        let column: string | undefined = undefined;
        let aggregationFunction: AggregationFunction | undefined = undefined;

        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = <AggregationFunction>this._consumeToken("AGGREGATION_FUNCTION").value;
            this._consumeToken("LPAREN");
            if (aggregationFunction !== "COUNT") {
                column = this._consumeToken("IDENTIFIER").value;
            }
            this._consumeToken("RPAREN");
        } else {
            column = this._consumeToken("IDENTIFIER").value;
        }

        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeToken("KEYWORD");
            displayName = this._consumeToken("IDENTIFIER").value;
        }

        return { column, displayName, aggregationFunction }
    }

    private _consumeWhereClauseOptional(): WhereFilter | undefined {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this._consumeToken("KEYWORD");
        return this._consumeCondition();
    }

    private _consumeCondition(): WhereFilter {
        const filters: WhereFilter[] = [];

        while (true) {
            const innerFilters = [this._consumeConditionGroup()];
            while (this._currentToken.value === "AND") {
                this._consumeToken("LOGICAL_OPERATOR");
                innerFilters.push(this._consumeConditionGroup());
            }
            const innerFilter = innerFilters.length === 1
                ? innerFilters[0]
                : new AndFilter(innerFilters);
            filters.push(innerFilter);
            if (this._currentToken.value !== "OR") {
                break;
            }
            this._currentToken = this._lexer.nextToken();
        }

        if (filters.length === 1) {
            return filters[0];
        }

        return new OrFilter(filters);
    }

    private _consumeConditionGroup(): WhereFilter {
        if (this._currentToken.type === "IDENTIFIER") {
            return this._consumeComparison();
        }
        this._consumeToken("LPAREN");
        const condition = this._consumeCondition();
        this._consumeToken("RPAREN");
        return condition;
    }

    private _consumeComparison(): WhereFilter {
        const column = this._consumeToken("IDENTIFIER").value;
        const comparisonOperator = this._consumeToken("COMPARISON_OPERATOR").value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeToken("NUMBER").value);
                return new GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeToken("NUMBER").value);
                return new GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeToken("NUMBER").value);
                return new LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeToken("NUMBER").value);
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
        this._consumeToken("KEYWORD");
        return this._consumeToken("IDENTIFIER").value;
    }

    private _consumeLimitAndOffsetClauseOptional(): LimitAndOffset | undefined {
        if (this._currentToken.value !== "LIMIT") {
            return undefined;
        }
        this._consumeToken("KEYWORD");
        const limit = Number(this._consumeToken("NUMBER").value);
        if (this._currentToken.value.valueOf() !== "OFFSET") {
            return { limit, offset: 0 };
        }
        this._consumeToken("KEYWORD");
        const offset = Number(this._consumeToken("NUMBER").value);
        return { limit, offset };
    }

    private _consumeToken(tokenType: TokenType, value?: string): Token {
        const token = this._currentToken;
        if (token.type === tokenType && (!value || token.value === value)) {
            this._currentToken = this._lexer.nextToken();
            return token;
        } else {
            throw new PQLError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition}`)
        }
    }

    private _consumeComparisonValue(): string | number | null {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
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

