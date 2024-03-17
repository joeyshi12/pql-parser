import { Token, TokenType } from './token';
import { Lexer } from './lexer';

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.nextToken();
    }

    parse() {
        this.eat(TokenType.KEYWORD)
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

    private error() {
        throw new Error("Invalid syntax");
    }

    private eat(tokenType: TokenType) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.nextToken();
        } else {
            this.error();
        }
    }

    private parsePlotType() {
        const token = this.currentToken;
        if (token.type === TokenType.KEYWORD) {
            this.eat(token.type);
            return token.value;
        } else {
            this.error();
        }
    }

    private parseUsingClause() {
        this.eat(TokenType.KEYWORD);
        const attribute1 = this.aggregatedColumn();
        this.eat(TokenType.KEYWORD);
        const attribute2 = this.aggregatedColumn();
        return [attribute1, attribute2];
    }

    private aggregatedColumn() {
        const token = this.currentToken;
        if (token.type === TokenType.KEYWORD) {
            const func = token.value;
            this.eat(token.type);
            this.eat(TokenType.LPAREN);
            const identifier = this.identifier();
            this.eat(TokenType.RPAREN);
            return `${func}(${identifier})`;
        } else {
            return this.identifier();
        }
    }

    private identifier() {
        const token = this.currentToken;
        this.eat(TokenType.IDENTIFIER);
        return token.value;
    }

    //private condition() {
    //    const identifier = this.identifier();
    //    const operator = this.currentToken;
    //    this.eat(TokenType.COMPARISON_OPERATOR);
    //    const value = this.currentToken;
    //    if (value.type === TokenType.NUMBER || value.type === TokenType.STRING || value.type === TokenType.NULL) {
    //        this.eat(value.type);
    //        return `${identifier} ${operator.value} ${value.value}`;
    //    } else {
    //        this.error();
    //    }
    //}

    //private booleanOperator() {
    //    const token = this.currentToken;
    //    if (token.type === TokenType.OR || token.type === TokenType.AND_OPERATOR) {
    //        this.eat(token.type);
    //        return token.value;
    //    } else {
    //        this.error();
    //    }
    //}

    //private parseOptionalClause(clauseFunction: () => any) {
    //    let clause = '';
    //    if (this.currentToken.type === clauseFunction.name.toUpperCase().replace('CLAUSE', '')) {
    //        this.eat(this.currentToken.type);
    //        clause += clauseFunction.call(this);
    //        while (this.currentToken.type === TokenType.OR || this.currentToken.type === TokenType.AND_OPERATOR) {
    //            clause += ' ' + this.booleanOperator() + ' ';
    //            clause += clauseFunction.call(this);
    //        }
    //    }
    //    return clause;
    //}

    //private aggregatedCondition() {
    //    return this.aggregatedColumn();
    //}
}

