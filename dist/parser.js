"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const exceptions_1 = require("./exceptions");
const filters_1 = require("./filters");
const pqlStatement_1 = require("./pqlStatement");
/**
 * Parser for Plot Query Language (PQL) queries
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
        const plotType = this._consumePlotClause();
        const usingAttributes = this._consumeUsingClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        const limitAndOffset = this._consumeLimitAndOffsetClauseOptional();
        this._consumeTokenWithType("EOF");
        this._validateAttributes(usingAttributes, groupByColumn);
        return new pqlStatement_1.PQLStatement(plotType, usingAttributes, whereFilter, groupByColumn, limitAndOffset);
    }
    _validateAttributes(attributes, groupByColumn) {
        if (groupByColumn) {
            attributes.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== groupByColumn) {
                    throw new exceptions_1.PQLError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        }
        else {
            attributes.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new exceptions_1.PQLError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }
    _consumePlotClause() {
        const plotToken = this._consumeTokenWithType("KEYWORD");
        if (plotToken.value !== "PLOT") {
            throw new exceptions_1.PQLError("Must begin query with PLOT");
        }
        return this._consumeTokenWithType("PLOT_TYPE").value;
    }
    _consumeUsingClause() {
        const usingToken = this._consumeTokenWithType("KEYWORD");
        if (usingToken.value !== "USING") {
            throw new exceptions_1.PQLError("Expected using clause");
        }
        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === "COMMA") {
                this._consumeTokenWithType("COMMA");
            }
            else {
                break;
            }
        }
        return attributes;
    }
    _consumeWhereClauseOptional() {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this._consumeTokenWithType("KEYWORD");
        return this._consumeCondition();
    }
    _consumeCondition() {
        const filters = [];
        while (true) {
            const innerFilters = [this._consumeConditionGroup()];
            while (this._currentToken.value === "AND") {
                this._consumeTokenWithType("LOGICAL_OPERATOR");
                innerFilters.push(this._consumeConditionGroup());
            }
            const innerFilter = innerFilters.length === 1
                ? innerFilters[0]
                : new filters_1.AndFilter(innerFilters);
            filters.push(innerFilter);
            if (this._currentToken.value !== "OR") {
                break;
            }
            this._advanceToken();
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
        this._consumeTokenWithType("LPAREN");
        const condition = this._consumeCondition();
        this._consumeTokenWithType("RPAREN");
        return condition;
    }
    _consumeComparison() {
        const column = this._consumeTokenWithType("IDENTIFIER").value;
        const comparisonOperator = this._consumeTokenWithType("COMPARISON_OPERATOR").value;
        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new filters_1.GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new filters_1.GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeTokenWithType("NUMBER").value);
                return new filters_1.LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeTokenWithType("NUMBER").value);
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
        this._consumeTokenWithType("KEYWORD");
        return this._consumeTokenWithType("IDENTIFIER").value;
    }
    _consumeLimitAndOffsetClauseOptional() {
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
    _consumeUsingAttribute() {
        let column = undefined;
        let aggregationFunction = undefined;
        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = this._consumeTokenWithType("AGGREGATION_FUNCTION").value;
            this._consumeTokenWithType("LPAREN");
            if (aggregationFunction !== "COUNT") {
                column = this._consumeTokenWithType("IDENTIFIER").value;
            }
            this._consumeTokenWithType("RPAREN");
        }
        else {
            column = this._consumeTokenWithType("IDENTIFIER").value;
        }
        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenWithType("KEYWORD");
            displayName = this._consumeTokenWithType("IDENTIFIER").value;
        }
        return { column, displayName, aggregationFunction };
    }
    _advanceToken() {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }
    _consumeTokenWithType(tokenType) {
        const token = this._currentToken;
        if (token.type === tokenType) {
            this._currentToken = this._lexer.nextToken();
            return token;
        }
        else {
            throw new exceptions_1.PQLError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`);
        }
    }
    _consumeComparisonValue() {
        const token = this._advanceToken();
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
