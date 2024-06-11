"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const exceptions_1 = require("./exceptions");
const filters_1 = require("./filters");
const pqlStatement_1 = require("./pqlStatement");
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
     * @returns PQL statement of the parsed PQL query
     */
    parse() {
        const plotCall = this._consumePlotClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        const limitAndOffset = this._consumeLimitAndOffsetClauseOptional();
        this._consumeToken("EOF");
        this._validateAttributes(plotCall, groupByColumn);
        return new pqlStatement_1.PQLStatement(plotCall, whereFilter, groupByColumn, limitAndOffset);
    }
    _validateAttributes(plotCall, groupByColumn) {
        if (groupByColumn) {
            plotCall.args.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== groupByColumn) {
                    throw new exceptions_1.PQLError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        }
        else {
            plotCall.args.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new exceptions_1.PQLError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }
    _consumePlotClause() {
        this._consumeToken("KEYWORD", "PLOT");
        const plotType = this._consumeToken("PLOT_TYPE").value;
        this._consumeToken("LPAREN");
        const args = new Map();
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
                throw new exceptions_1.PQLError(`Invalid plot type ${plotType}`);
        }
        this._consumeToken("RPAREN");
        return { plotType, args };
    }
    _consumePlotColumn() {
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
        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeToken("KEYWORD");
            displayName = this._consumeToken("IDENTIFIER").value;
        }
        return { column, displayName, aggregationFunction };
    }
    _consumeWhereClauseOptional() {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this._consumeToken("KEYWORD");
        return this._consumeCondition();
    }
    _consumeCondition() {
        const filters = [];
        while (true) {
            const innerFilters = [this._consumeConditionGroup()];
            while (this._currentToken.value === "AND") {
                this._consumeToken("LOGICAL_OPERATOR");
                innerFilters.push(this._consumeConditionGroup());
            }
            const innerFilter = innerFilters.length === 1
                ? innerFilters[0]
                : new filters_1.AndFilter(innerFilters);
            filters.push(innerFilter);
            if (this._currentToken.value !== "OR") {
                break;
            }
            this._currentToken = this._lexer.nextToken();
        }
        if (filters.length === 1) {
            return filters[0];
        }
        return new filters_1.OrFilter(filters);
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
        const column = this._consumeToken("IDENTIFIER").value;
        const comparisonOperator = this._consumeToken("COMPARISON_OPERATOR").value;
        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeToken("NUMBER").value);
                return new filters_1.GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeToken("NUMBER").value);
                return new filters_1.GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeToken("NUMBER").value);
                return new filters_1.LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeToken("NUMBER").value);
                return new filters_1.LessThanOrEqualFilter(column, value);
            case "=":
                return new filters_1.EqualFilter(column, this._consumeComparisonValue());
            case "!=":
                return new filters_1.NotEqualFilter(column, this._consumeComparisonValue());
            default:
                throw new exceptions_1.PQLError(`Invalid comparison operator ${comparisonOperator}`);
        }
    }
    _consumeGroupByClauseOptional() {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this._consumeToken("KEYWORD");
        return this._consumeToken("IDENTIFIER").value;
    }
    _consumeLimitAndOffsetClauseOptional() {
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
