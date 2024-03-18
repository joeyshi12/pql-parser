"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const types_1 = require("./types");
const exceptions_1 = require("./exceptions");
class Parser {
    constructor(lexer) {
        this._lexer = lexer;
        this._currentToken = this._lexer.nextToken();
    }
    parse() {
        const plotType = this.consumePlotClause();
        const usingAttributes = this.consumeUsingClause();
        const whereFilter = this.consumeWhereClauseOptional();
        return {
            plotType,
            usingAttributes,
            whereFilter
        };
    }
    consumePlotClause() {
        const plotToken = this.consumeToken(types_1.TokenType.KEYWORD);
        if (plotToken.value !== "PLOT") {
            throw new exceptions_1.PQLParsingError("Must begin query with PLOT");
        }
        return this.consumeToken(types_1.TokenType.PLOT_TYPE).value;
    }
    consumeUsingClause() {
        const usingToken = this.consumeToken(types_1.TokenType.KEYWORD);
        if (usingToken.value !== "USING") {
            throw new exceptions_1.PQLParsingError("Expected using clause");
        }
        const attributes = [];
        while (true) {
            const attribute = this.consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === types_1.TokenType.COMMA) {
                this.consumeToken(types_1.TokenType.COMMA);
            }
            else {
                break;
            }
        }
        return attributes;
    }
    // TODO: handle chained and nested where clauses
    consumeWhereClauseOptional() {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this.consumeToken(types_1.TokenType.KEYWORD);
        const column = this.consumeToken(types_1.TokenType.IDENTIFIER).value;
        const comparisonOperator = this.consumeToken(types_1.TokenType.COMPARISON_OPERATOR).value;
        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this.consumeToken(types_1.TokenType.NUMBER).value);
                return { gt: { column, value } };
            case ">=":
                value = Number(this.consumeToken(types_1.TokenType.NUMBER).value);
                return { gte: { column, value } };
            case "<":
                value = Number(this.consumeToken(types_1.TokenType.NUMBER).value);
                return { lt: { column, value } };
            case "<=":
                value = Number(this.consumeToken(types_1.TokenType.NUMBER).value);
                return { lte: { column, value } };
            case "=":
                const token = this.nextToken();
                switch (token.type) {
                    case types_1.TokenType.STRING:
                        return { eq: { column, value: token.value } };
                    case types_1.TokenType.NUMBER:
                        return { eq: { column, value: Number(token.value) } };
                    case types_1.TokenType.NULL:
                        return { eq: { column, value: null } };
                    default:
                        throw new exceptions_1.PQLParsingError("Equal comparison allowed only for string, number, and null");
                }
            default:
                throw new exceptions_1.PQLParsingError(`Invalid comparison operator ${comparisonOperator}`);
        }
    }
    consumeUsingAttribute() {
        const columnName = this.consumeToken(types_1.TokenType.IDENTIFIER).value;
        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this.consumeToken(types_1.TokenType.KEYWORD);
            displayName = this.consumeToken(types_1.TokenType.IDENTIFIER).value;
        }
        return { column: columnName, displayName };
    }
    nextToken() {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }
    consumeToken(tokenType) {
        const token = this._currentToken;
        if (token.type === tokenType) {
            this._currentToken = this._lexer.nextToken();
            return token;
        }
        else {
            throw new exceptions_1.PQLParsingError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`);
        }
    }
}
exports.Parser = Parser;
