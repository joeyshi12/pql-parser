"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const types_1 = require("./types");
const exceptions_1 = require("./exceptions");
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
     * @returns The syntax tree representing the parsed PQL query
     */
    parse() {
        const plotType = this._consumePlotClause();
        const usingAttributes = this._consumeUsingClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        this._consumeTokenType(types_1.TokenType.EOF);
        const syntaxTree = {
            plotType,
            usingAttributes,
            whereFilter,
            groupByColumn
        };
        this._validateSyntaxTree(syntaxTree);
        return syntaxTree;
    }
    _validateSyntaxTree(syntaxTree) {
        if (syntaxTree.groupByColumn) {
            syntaxTree.usingAttributes.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== syntaxTree.groupByColumn) {
                    throw new exceptions_1.PQLParsingError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        }
        else {
            syntaxTree.usingAttributes.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new exceptions_1.PQLParsingError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }
    _consumePlotClause() {
        const plotToken = this._consumeTokenType(types_1.TokenType.KEYWORD);
        if (plotToken.value !== "PLOT") {
            throw new exceptions_1.PQLParsingError("Must begin query with PLOT");
        }
        return this._consumeTokenType(types_1.TokenType.PLOT_TYPE).value;
    }
    _consumeUsingClause() {
        const usingToken = this._consumeTokenType(types_1.TokenType.KEYWORD);
        if (usingToken.value !== "USING") {
            throw new exceptions_1.PQLParsingError("Expected using clause");
        }
        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === types_1.TokenType.COMMA) {
                this._consumeTokenType(types_1.TokenType.COMMA);
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
        this._consumeTokenType(types_1.TokenType.KEYWORD);
        const column = this._consumeTokenType(types_1.TokenType.IDENTIFIER).value;
        const comparisonOperator = this._consumeTokenType(types_1.TokenType.COMPARISON_OPERATOR).value;
        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeTokenType(types_1.TokenType.NUMBER).value);
                return { gt: { column, value } };
            case ">=":
                value = Number(this._consumeTokenType(types_1.TokenType.NUMBER).value);
                return { gte: { column, value } };
            case "<":
                value = Number(this._consumeTokenType(types_1.TokenType.NUMBER).value);
                return { lt: { column, value } };
            case "<=":
                value = Number(this._consumeTokenType(types_1.TokenType.NUMBER).value);
                return { lte: { column, value } };
            case "=":
                const token = this._consumeToken();
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
    _consumeGroupByClauseOptional() {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this._consumeTokenType(types_1.TokenType.KEYWORD);
        return this._consumeTokenType(types_1.TokenType.IDENTIFIER).value;
    }
    _consumeUsingAttribute() {
        let column = undefined;
        let aggregationFunction = undefined;
        if (this._currentToken.type === types_1.TokenType.AGGREGATION_FUNCTION) {
            aggregationFunction = this._consumeTokenType(types_1.TokenType.AGGREGATION_FUNCTION).value;
            this._consumeTokenType(types_1.TokenType.LPAREN);
            if (this._currentToken.type.valueOf() === types_1.TokenType.IDENTIFIER.valueOf()) {
                column = this._consumeTokenType(types_1.TokenType.IDENTIFIER).value;
            }
            else if (this._currentToken.value !== "COUNT") {
                throw new exceptions_1.PQLParsingError(`Missing identifier in aggregation function ${aggregationFunction}`);
            }
            this._consumeTokenType(types_1.TokenType.RPAREN);
        }
        else {
            column = this._consumeTokenType(types_1.TokenType.IDENTIFIER).value;
        }
        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenType(types_1.TokenType.KEYWORD);
            displayName = this._consumeTokenType(types_1.TokenType.IDENTIFIER).value;
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
            throw new exceptions_1.PQLParsingError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`);
        }
    }
}
exports.Parser = Parser;
