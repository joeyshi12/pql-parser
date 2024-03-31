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
    public parse(): PQLSyntaxTree {
        const plotType = this._consumePlotClause();
        const usingAttributes = this._consumeUsingClause();
        const whereFilter = this._consumeWhereClauseOptional();
        const groupByColumn = this._consumeGroupByClauseOptional();
        this._consumeTokenType(TokenType.EOF);
        const syntaxTree: PQLSyntaxTree = {
            plotType,
            usingAttributes,
            whereFilter,
            groupByColumn
        };
        this._validateSyntaxTree(syntaxTree);
        return syntaxTree;
    }

    private _validateSyntaxTree(syntaxTree: PQLSyntaxTree) {
        if (syntaxTree.groupByColumn) {
            syntaxTree.usingAttributes.forEach(attribute => {
                if (!attribute.aggregationFunction && attribute.column !== syntaxTree.groupByColumn) {
                    throw new PQLParsingError(`Invalid column ${attribute.column} - aggregation queries can only have aggregated or group by columns`);
                }
            });
        } else {
            syntaxTree.usingAttributes.forEach(attribute => {
                if (attribute.aggregationFunction) {
                    throw new PQLParsingError(`Cannot include aggregated column ${attribute.aggregationFunction}(${attribute.column}) without a group by clause`);
                }
            });
        }
    }

    private _consumePlotClause(): string {
        const plotToken = this._consumeTokenType(TokenType.KEYWORD);
        if (plotToken.value !== "PLOT") {
            throw new PQLParsingError("Must begin query with PLOT");
        }
        return this._consumeTokenType(TokenType.PLOT_TYPE).value;
    }

    private _consumeUsingClause(): UsingAttribute[] {
        const usingToken = this._consumeTokenType(TokenType.KEYWORD);
        if (usingToken.value !== "USING") {
            throw new PQLParsingError("Expected using clause");
        }

        const attributes = [];
        while (true) {
            const attribute = this._consumeUsingAttribute();
            attributes.push(attribute);
            if (this._currentToken.type === TokenType.COMMA) {
                this._consumeTokenType(TokenType.COMMA);
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
        this._consumeTokenType(TokenType.KEYWORD);
        const column = this._consumeTokenType(TokenType.IDENTIFIER).value;
        const comparisonOperator = this._consumeTokenType(TokenType.COMPARISON_OPERATOR).value;

        let value;
        switch (comparisonOperator) {
            case ">":
                value = Number(this._consumeTokenType(TokenType.NUMBER).value);
                return { gt: { column, value } };
            case ">=":
                value = Number(this._consumeTokenType(TokenType.NUMBER).value);
                return { gte: { column, value } };
            case "<":
                value = Number(this._consumeTokenType(TokenType.NUMBER).value);
                return { lt: { column, value } };
            case "<=":
                value = Number(this._consumeTokenType(TokenType.NUMBER).value);
                return { lte: { column, value } };
            case "=":
                const token = this._consumeToken();
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

    private _consumeGroupByClauseOptional(): string | undefined {
        if (this._currentToken.value !== "GROUPBY") {
            return undefined;
        }
        this._consumeTokenType(TokenType.KEYWORD);
        return this._consumeTokenType(TokenType.IDENTIFIER).value;
    }

    private _consumeUsingAttribute(): UsingAttribute {
        let column = undefined;
        let aggregationFunction = undefined;

        if (this._currentToken.type === TokenType.AGGREGATION_FUNCTION) {
            aggregationFunction = this._consumeTokenType(TokenType.AGGREGATION_FUNCTION).value;
            this._consumeTokenType(TokenType.LPAREN);
            if (this._currentToken.type.valueOf() === TokenType.IDENTIFIER.valueOf()) {
                column = this._consumeTokenType(TokenType.IDENTIFIER).value;
            } else if (this._currentToken.value !== "COUNT") {
                throw new PQLParsingError(`Missing identifier in aggregation function ${aggregationFunction}`);
            }
            this._consumeTokenType(TokenType.RPAREN);
        } else {
            column = this._consumeTokenType(TokenType.IDENTIFIER).value;
        }

        let displayName = undefined;
        if (this._currentToken.value === "AS") {
            this._consumeTokenType(TokenType.KEYWORD);
            displayName = this._consumeTokenType(TokenType.IDENTIFIER).value;
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
            throw new PQLParsingError(`Unexpected token ${JSON.stringify(this._currentToken)} at position ${this._lexer.currentPosition()}`)
        }
    }
}

