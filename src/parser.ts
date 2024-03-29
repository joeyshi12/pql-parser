import { PQLSyntaxTree, Token, TokenType, UsingAttribute, WhereFilter } from './types';
import { Lexer } from './lexer';
import { PQLParsingError } from './exceptions';

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
    * @returns The syntax tree representing the parsed PQL query
    */
    parse(): PQLSyntaxTree {
        const plotType = this.consumePlotClause();
        const usingAttributes = this.consumeUsingClause();
        const whereFilter = this.consumeWhereClauseOptional();
        const groupByColumn = this.consumeGroupByClauseOptional();
        this.consumeToken(TokenType.EOF);
        return {
            plotType,
            usingAttributes,
            whereFilter,
            groupByColumn
        };
    }

    private consumePlotClause(): string {
        const plotToken = this.consumeToken(TokenType.KEYWORD);
        if (plotToken.value !== "PLOT") {
            throw new PQLParsingError("Must begin query with PLOT");
        }
        return this.consumeToken(TokenType.PLOT_TYPE).value;
    }

    private consumeUsingClause(): UsingAttribute[] {
        const usingToken = this.consumeToken(TokenType.KEYWORD);
        if (usingToken.value !== "USING") {
            throw new PQLParsingError("Expected using clause");
        }

        const attributes = [];
        while (true) {
            const attribute = this.consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === TokenType.COMMA) {
                this.consumeToken(TokenType.COMMA);
            } else {
                break;
            }
        }
        return attributes;
    }

    // TODO: handle chained and nested where clauses
    private consumeWhereClauseOptional(): WhereFilter | undefined {
        if (this._currentToken.value !== "WHERE") {
            return undefined;
        }
        this.consumeToken(TokenType.KEYWORD);
        const column = this.consumeToken(TokenType.IDENTIFIER).value;
        const comparisonOperator = this.consumeToken(TokenType.COMPARISON_OPERATOR).value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this.consumeToken(TokenType.NUMBER).value);
                return { gt: { column, value } };
            case ">=":
                value = Number(this.consumeToken(TokenType.NUMBER).value);
                return { gte: { column, value } };
            case "<":
                value = Number(this.consumeToken(TokenType.NUMBER).value);
                return { lt: { column, value } };
            case "<=":
                value = Number(this.consumeToken(TokenType.NUMBER).value);
                return { lte: { column, value } };
            case "=":
                const token = this.nextToken();
                switch (token.type) {
                    case TokenType.STRING:
                        return { eq: { column, value: token.value  } };
                    case TokenType.NUMBER:
                        return { eq: { column, value: Number(token.value) } };
                    case TokenType.NULL:
                        return { eq: { column, value: null } };
                    default:
                        throw new PQLParsingError("Equal comparison allowed only for string, number, and null");
                }
            default:
                throw new PQLParsingError(`Invalid comparison operator ${comparisonOperator}`)
        }
    }

    private consumeGroupByClauseOptional(): string | undefined {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this.consumeToken(TokenType.KEYWORD);
        return this.consumeToken(TokenType.IDENTIFIER).value;
    }

    private consumeUsingAttribute(): UsingAttribute {
        let column = undefined;
        let aggregationFunction = undefined;

        if (this._currentToken.type === TokenType.AGGREGATION_FUNCTION) {
            aggregationFunction = this.consumeToken(TokenType.AGGREGATION_FUNCTION).value;
            this.consumeToken(TokenType.LPAREN);
            column = this.consumeToken(TokenType.IDENTIFIER).value;
            this.consumeToken(TokenType.RPAREN);
        } else {
            column = this.consumeToken(TokenType.IDENTIFIER).value;
        }

        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this.consumeToken(TokenType.KEYWORD);
            displayName = this.consumeToken(TokenType.IDENTIFIER).value;
        }

        return { column, displayName, aggregationFunction }
    }

    private nextToken(): Token {
        const token = this._currentToken;
        this._currentToken = this._lexer.nextToken();
        return token;
    }

    private consumeToken(tokenType: TokenType): Token {
        const token = this._currentToken;
        if (token.type === tokenType) {
            this._currentToken = this._lexer.nextToken();
            return token;
        } else {
            throw new PQLParsingError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`)
        }
    }
}

