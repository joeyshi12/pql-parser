"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("./token");
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.nextToken();
    }
    parse() {
        this.eat(token_1.TokenType.KEYWORD);
        if (this.currentToken.value !== "PLOT") {
            throw new Error("Must begin query with PLOT");
        }
        const plotType = this.parsePlotType();
        const usingClause = this.parseUsingClause();
        //const whereClause = this.parseOptionalClause(this.condition);
        //const groupByClause = this.parseOptionalClause(this.identifier);
        //const havingClause = this.parseOptionalClause(this.aggregatedCondition);
        return {
            plotType,
            usingClause,
            //whereClause,
            //groupByClause,
            //havingClause
        };
    }
    error() {
        throw new Error("Invalid syntax");
    }
    eat(tokenType) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.nextToken();
        }
        else {
            this.error();
        }
    }
    parsePlotType() {
        const token = this.currentToken;
        if (token.type === token_1.TokenType.KEYWORD) {
            this.eat(token.type);
            return token.value;
        }
        else {
            this.error();
        }
    }
    parseUsingClause() {
        this.eat(token_1.TokenType.KEYWORD);
        const attribute1 = this.aggregatedColumn();
        this.eat(token_1.TokenType.KEYWORD);
        const attribute2 = this.aggregatedColumn();
        return [attribute1, attribute2];
    }
    aggregatedColumn() {
        const token = this.currentToken;
        if (token.type === token_1.TokenType.KEYWORD) {
            const func = token.value;
            this.eat(token.type);
            this.eat(token_1.TokenType.LPAREN);
            const identifier = this.identifier();
            this.eat(token_1.TokenType.RPAREN);
            return `${func}(${identifier})`;
        }
        else {
            return this.identifier();
        }
    }
    identifier() {
        const token = this.currentToken;
        this.eat(token_1.TokenType.IDENTIFIER);
        return token.value;
    }
}
exports.Parser = Parser;
