import { Token, TokenType } from "./types";

export class Lexer {
    private input: string;
    private position: number = 0;
    private currentChar: string | null = null;

    constructor(input: string) {
        this.input = input;
        this.currentChar = this.input[this.position];
    }

    private advance() {
        this.position++;
        this.currentChar = this.input[this.position];
    }

    private skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    private isAlphabetic(char: string) {
        return /[A-Za-z]/.test(char);
    }

    private isDigit(char: string) {
        return /[0-9]/.test(char);
    }

    private peek(): string | null {
        const peekPosition = this.position + 1;
        if (peekPosition >= this.input.length) {
            return null;
        }
        return this.input[peekPosition];
    }

    private alphanumeric(): string {
        let result = '';
        while (this.currentChar && (this.isAlphabetic(this.currentChar) || this.isDigit(this.currentChar) || this.currentChar === '_')) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    private string(): string {
        let result = '';
        while (this.currentChar !== "'") {
            if (!this.currentChar) {
                throw new Error("Unterminated string");
            }
            result += this.currentChar;
            this.advance();
        }
        this.advance(); // Consume closing quote
        return result;
    }

    private number(): string {
        let result = '';
        while (this.currentChar && this.isDigit(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    getNextToken(): Token {
        while (this.currentChar) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (this.currentChar === "'") {
                this.advance();
                return new Token(TokenType.STRING, this.string());
            }

            if (this.isAlphabetic(this.currentChar)) {
                const identifier = this.alphanumeric();
                switch (identifier.toUpperCase()) {
                    case 'PLOT':
                        return new Token(TokenType.PLOT, identifier);
                    case 'BAR':
                        return new Token(TokenType.BAR, identifier);
                    case 'LINE':
                        return new Token(TokenType.LINE, identifier);
                    case 'SCATTER':
                        return new Token(TokenType.SCATTER, identifier);
                    case 'USING':
                        return new Token(TokenType.USING, identifier);
                    case 'AND':
                        return new Token(TokenType.AND, identifier);
                    case 'WHERE':
                        return new Token(TokenType.WHERE, identifier);
                    case 'GROUP':
                        if (this.peek() === 'B') {
                            return new Token(TokenType.GROUP_BY, identifier + ' ' + this.alphanumeric());
                        }
                        break;
                    case 'HAVING':
                        return new Token(TokenType.HAVING, identifier);
                    case 'AVG':
                        return new Token(TokenType.AVG, identifier);
                    case 'COUNT':
                        return new Token(TokenType.COUNT, identifier);
                    case 'SUM':
                        return new Token(TokenType.SUM, identifier);
                    case 'NULL':
                        return new Token(TokenType.NULL, identifier);
                    case 'OR':
                        return new Token(TokenType.OR, identifier);
                    case 'AND':
                        return new Token(TokenType.AND_OPERATOR, identifier);
                    default:
                        return new Token(TokenType.IDENTIFIER, identifier);
                }
            }

            if (this.isDigit(this.currentChar)) {
                return new Token(TokenType.NUMBER, this.number());
            }

            if (this.currentChar === '>' || this.currentChar === '<' || this.currentChar === '=') {
                let operator = this.currentChar;
                this.advance();
                if (this.currentChar === '=') {
                    operator += this.currentChar;
                    this.advance();
                }
                return new Token(TokenType.COMPARISON_OPERATOR, operator);
            }

            if (this.currentChar === ',' || this.currentChar === '(' || this.currentChar === ')') {
                const token = new Token(TokenType.IDENTIFIER, this.currentChar);
                this.advance();
                return token;
            }

            throw new Error("Invalid character");
        }

        return new Token(TokenType.EOF, '');
    }
}
