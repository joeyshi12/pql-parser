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
        this._consumeTokenType("EOF");
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
        const plotToken = this._consumeTokenType("KEYWORD");
        if (plotToken.value !== "PLOT") {
            throw new exceptions_1.PQLError("Must begin query with PLOT");
        }
        return this._consumeTokenType("PLOT_TYPE").value;
    }
    _consumeUsingClause() {
        const usingToken = this._consumeTokenType("KEYWORD");
        if (usingToken.value !== "USING") {
            throw new exceptions_1.PQLError("Expected using clause");
        }
        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === "COMMA") {
                this._consumeTokenType("COMMA");
            }
            else {
                break;
            }
        }
        return attributes;
    }
    // TODO: handle chained and nested where clauses
    _consumeWhereClauseOptional() {
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
                return new filters_1.GreaterThanFilter(column, value);
            case ">=":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new filters_1.GreaterThanOrEqualFilter(column, value);
            case "<":
                value = Number(this._consumeTokenType("NUMBER").value);
                return new filters_1.LessThanFilter(column, value);
            case "<=":
                value = Number(this._consumeTokenType("NUMBER").value);
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
        this._consumeTokenType("KEYWORD");
        return this._consumeTokenType("IDENTIFIER").value;
    }
    _consumeLimitAndOffsetClauseOptional() {
        if (this._currentToken.value !== "LIMIT") {
            return undefined;
        }
        this._consumeTokenType("KEYWORD");
        const limit = Number(this._consumeTokenType("NUMBER").value);
        if (this._currentToken.value.valueOf() !== "OFFSET") {
            return { limit, offset: 0 };
        }
        this._consumeTokenType("KEYWORD");
        const offset = Number(this._consumeTokenType("NUMBER").value);
        return { limit, offset };
    }
    _consumeUsingAttribute() {
        let column = undefined;
        let aggregationFunction = undefined;
        if (this._currentToken.type === "AGGREGATION_FUNCTION") {
            aggregationFunction = this._consumeTokenType("AGGREGATION_FUNCTION").value;
            this._consumeTokenType("LPAREN");
            if (aggregationFunction !== "COUNT") {
                column = this._consumeTokenType("IDENTIFIER").value;
            }
            this._consumeTokenType("RPAREN");
        }
        else {
            column = this._consumeTokenType("IDENTIFIER").value;
        }
        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenType("KEYWORD");
            displayName = this._consumeTokenType("IDENTIFIER").value;
        }
        return { column, displayName, aggregationFunction };
    }
    _consumeToken() {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }
    _consumeTokenType(tokenType) {
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
        const token = this._consumeToken();
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
