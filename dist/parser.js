"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const exceptions_1 = require("./exceptions");
/**
 * Parser for PQL queries
 */
class Parser {
    constructor(lexer) {
        this._lexer = lexer;
        this._currentToken = this._lexer.nextToken();
    }
    /**
     * Parses the PQL query into a syntax tree
     * @returns AST of the PQL query
     */
    parse() {
        const query = {
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
        if (this._currentToken.value === "LIMIT") {
            query.limitAndOffset = this._consumeLimitAndOffsetClause();
        }
        this._consumeToken("EOF");
        return query;
    }
    _consumePlotClause() {
        this._consumeToken("KEYWORD", "PLOT");
        const plotFunction = this._consumeToken("PLOT_FUNCTION").value;
        this._consumeToken("LPAREN");
        const plotClause = this._consumePlotArgs(plotFunction);
        this._consumeToken("RPAREN");
        return plotClause;
    }
    _consumePlotArgs(plotFunction) {
        switch (plotFunction) {
            case "BAR":
                const categoriesColumn = this._consumeColumn();
                this._consumeToken("COMMA");
                const valuesColumn = this._consumeColumn();
                return {
                    plotFunction,
                    categoriesColumn,
                    valuesColumn
                };
            case "LINE":
            case "SCATTER":
                const xColumn = this._consumeColumn();
                this._consumeToken("COMMA");
                const yColumn = this._consumeColumn();
                return {
                    plotFunction,
                    xColumn,
                    yColumn
                };
            default:
                throw new exceptions_1.PQLError(`Invalid plot type ${plotFunction}`);
        }
    }
    _consumeColumn() {
        let column = undefined;
        let aggregationFunction = undefined;
        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = this._consumeToken("AGGREGATION_FUNCTION").value;
            this._consumeToken("LPAREN");
            if (aggregationFunction !== "COUNT") {
                column = this._consumeToken("IDENTIFIER").value;
            }
            this._consumeToken("RPAREN");
        }
        else {
            column = this._consumeToken("IDENTIFIER").value;
        }
        let identifier = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeToken("KEYWORD");
            identifier = this._consumeToken("IDENTIFIER").value;
        }
        if (!identifier) {
            if (aggregationFunction) {
                identifier = `${aggregationFunction}(${column !== null && column !== void 0 ? column : ""})`;
            }
            else {
                identifier = column;
            }
        }
        const columnMetadata = { identifier };
        if (column) {
            columnMetadata.column = column;
        }
        if (aggregationFunction) {
            columnMetadata.aggregationFunction = aggregationFunction;
        }
        return columnMetadata;
    }
    _consumeCondition() {
        const filters = [];
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
    _consumeConditionGroup() {
        if (this._currentToken.type === "IDENTIFIER") {
            return this._consumeComparison();
        }
        this._consumeToken("LPAREN");
        const condition = this._consumeCondition();
        this._consumeToken("RPAREN");
        return condition;
    }
    _consumeComparison() {
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
                throw new exceptions_1.PQLError(`Invalid comparison operator ${comparisonOperator}`);
        }
    }
    _consumeLimitAndOffsetClause() {
        this._consumeToken("KEYWORD");
        const limit = Number(this._consumeToken("NUMBER").value);
        if (this._currentToken.value.valueOf() !== "OFFSET") {
            return { limit, offset: 0 };
        }
        this._consumeToken("KEYWORD");
        const offset = Number(this._consumeToken("NUMBER").value);
        return { limit, offset };
    }
    _consumeToken(tokenType, value) {
        const token = this._currentToken;
        if (token.type === tokenType && (!value || token.value === value)) {
            this._currentToken = this._lexer.nextToken();
            return token;
        }
        else {
            throw new exceptions_1.PQLError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition}`);
        }
    }
    _consumeComparisonValue() {
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
                throw new exceptions_1.PQLError("Equal comparison allowed only for string, number, and null");
        }
    }
}
exports.Parser = Parser;
