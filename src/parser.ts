import { AggregationFunction, LimitAndOffset, PlotFunction, Token, TokenType, PQLQuery, PlotClause, ColumnMetadata, WhereCondition, BarPlotCall, PointPlotCall } from './types';
import { Lexer } from './lexer';
import { PQLError } from './exceptions';

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
    * @returns AST of the PQL query
    */
    public parse(): PQLQuery {
        const query: PQLQuery = {
            plotClause: this._consumePlotClause()
        };
        if (this._currentToken.value === "WHERE") {
            this._consumeToken("KEYWORD");
            query.whereCondition = this._consumeCondition();
        }
        if (this._currentToken.value === "GROUPBY") {
            this._consumeToken("KEYWORD");
            query.groupKey = this._consumeToken("IDENTIFIER").value;
        }
        if (this._currentToken.value == "LIMIT") {
            query.limitAndOffset = this._consumeLimitAndOffsetClause();
        }
        this._consumeToken("EOF");
        return query;
    }

    private _consumePlotClause(): PlotClause {
        this._consumeToken("KEYWORD", "PLOT");
        const plotFunction = <PlotFunction>this._consumeToken("PLOT_FUNCTION").value;
        this._consumeToken("LPAREN");
        const plotClause = this._consumePlotArgs(plotFunction);
        this._consumeToken("RPAREN");
        return plotClause;
    }

    private _consumePlotArgs(plotFunction: PlotFunction): PlotClause {
        switch (plotFunction) {
            case "BAR":
                const categoriesColumn = this._consumeColumn();
                this._consumeToken("COMMA");
                const valuesColumn = this._consumeColumn();
                return {
                    plotFunction,
                    categoriesColumn,
                    valuesColumn
                } as BarPlotCall;
            case "LINE":
            case "SCATTER":
                const xColumn = this._consumeColumn();
                this._consumeToken("COMMA");
                const yColumn = this._consumeColumn();
                return {
                    plotFunction,
                    xColumn,
                    yColumn
                } as PointPlotCall;
            default:
                throw new PQLError(`Invalid plot type ${plotFunction}`);
        }
    }

    private _consumeColumn(): ColumnMetadata {
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

        let identifier = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeToken("KEYWORD");
            identifier = this._consumeToken("IDENTIFIER").value;
        }

        if (!identifier) {
            if (aggregationFunction) {
                identifier = `${aggregationFunction}(${column ?? ""})`
            } else {
                identifier = column!;
            }
        }

        const columnMetadata: ColumnMetadata = { identifier };
        if (column) {
            columnMetadata.column = column;
        }
        if (aggregationFunction) {
            columnMetadata.aggregationFunction = aggregationFunction;
        }
        return columnMetadata;
    }

    private _consumeCondition(): WhereCondition {
        const filters: WhereCondition[] = [];

        while (true) {
            const innerConditions = [this._consumeConditionGroup()];
            while (this._currentToken.value === "AND") {
                this._consumeToken("LOGICAL_OPERATOR");
                innerConditions.push(this._consumeConditionGroup());
            }
            const innerCondition = innerConditions.length === 1
                ? innerConditions[0]
                : { and: innerConditions };
            filters.push(innerCondition);
            if (this._currentToken.value !== "OR") {
                break;
            }
            this._currentToken = this._lexer.nextToken();
        }

        if (filters.length === 1) {
            return filters[0];
        }

        return { or: filters };
    }

    private _consumeConditionGroup(): WhereCondition {
        if (this._currentToken.type === "IDENTIFIER") {
            return this._consumeComparison();
        }
        this._consumeToken("LPAREN");
        const condition = this._consumeCondition();
        this._consumeToken("RPAREN");
        return condition;
    }

    private _consumeComparison(): WhereCondition {
        const key = this._consumeToken("IDENTIFIER").value;
        const comparisonOperator = this._consumeToken("COMPARISON_OPERATOR").value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeToken("NUMBER").value);
                return { gt: { key, value } };
            case ">=":
                value = Number(this._consumeToken("NUMBER").value);
                return { gte: { key, value } };
            case "<":
                value = Number(this._consumeToken("NUMBER").value);
                return { lt: { key, value } };
            case "<=":
                value = Number(this._consumeToken("NUMBER").value);
                return { lte: { key, value } };
            case "=":
                return { eq: { key, value: this._consumeComparisonValue() } };
            case "!=":
                return { neq: { key, value: this._consumeComparisonValue() } };
            default:
                throw new PQLError(`Invalid comparison operator ${comparisonOperator}`)
        }
    }

    private _consumeLimitAndOffsetClause(): LimitAndOffset {
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

