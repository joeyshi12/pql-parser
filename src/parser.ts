import { Token, TokenType } from './types';
import { Lexer } from './lexer';

export class Parser {
    private lexer: Lexer;
    private currentToken: Token;

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    private error() {
        throw new Error("Invalid syntax");
    }

    private eat(tokenType: TokenType) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            this.error();
        }
    }

    private plotType() {
        const token = this.currentToken;
        if (token.type === TokenType.BAR || token.type === TokenType.LINE || token.type === TokenType.SCATTER) {
            this.eat(token.type);
            return token.value;
        } else {
            this.error();
        }
    }

    private usingClause() {
        this.eat(TokenType.USING);
        const attribute1 = this.aggregatedColumn();
        this.eat(TokenType.AND);
        const attribute2 = this.aggregatedColumn();
        return [attribute1, attribute2];
    }

    private aggregatedColumn() {
        const token = this.currentToken;
        if (token.type === TokenType.AVG || token.type === TokenType.COUNT || token.type === TokenType.SUM) {
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

    private condition() {
        const identifier = this.identifier();
        const operator = this.currentToken;
        this.eat(TokenType.COMPARISON_OPERATOR);
        const value = this.currentToken;
        if (value.type === TokenType.NUMBER || value.type === TokenType.STRING || value.type === TokenType.NULL) {
            this.eat(value.type);
            return `${identifier} ${operator.value} ${value.value}`;
        } else {
            this.error();
        }
    }

    private booleanOperator() {
        const token = this.currentToken;
        if (token.type === TokenType.OR || token.type === TokenType.AND_OPERATOR) {
            this.eat(token.type);
            return token.value;
        } else {
            this.error();
        }
    }

    private parseOptionalClause(clauseFunction: () => any) {
        let clause = '';
        if (this.currentToken.type === clauseFunction.name.toUpperCase().replace('CLAUSE', '')) {
            this.eat(this.currentToken.type);
            clause += clauseFunction.call(this);
            while (this.currentToken.type === TokenType.OR || this.currentToken.type === TokenType.AND_OPERATOR) {
                clause += ' ' + this.booleanOperator() + ' ';
                clause += clauseFunction.call(this);
            }
        }
        return clause;
    }

    parse() {
        this.eat(TokenType.PLOT);
        const plotType = this.plotType();
        const usingClause = this.usingClause();
        const whereClause = this.parseOptionalClause(this.condition);
        const groupByClause = this.parseOptionalClause(this.identifier);
        const havingClause = this.parseOptionalClause(this.aggregatedCondition);

        return {
            plotType,
            usingClause,
            whereClause,
            groupByClause,
            havingClause
        };
    }

    private aggregatedCondition() {
        return this.aggregatedColumn();
    }
}

