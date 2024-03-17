import { Token, TokenType } from "./token";

export class Lexer {
    private _input: string;
    private _position: number = 0;
    private _currentChar: string | null = null;

    constructor(input: string) {
        this._input = input;
        this._currentChar = this._input[this._position];
    }

    public peek(): string | null {
        const peekPosition = this._position + 1;
        if (peekPosition >= this._input.length) {
            return null;
        }
        return this._input[peekPosition];
    }

    public nextToken(): Token {
        while (this._currentChar) {
            if (/\s/.test(this._currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (this._currentChar === "'") {
                this.advance();
                return { type: TokenType.STRING, value: this.readString() };
            }

            if (this.isDigit(this._currentChar)) {
                return { type: TokenType.NUMBER, value: this.readNumber() };
            }

            switch (this._currentChar) {
                case ",":
                    this.advance();
                    return { type: TokenType.COMMA, value: "," };
                case "(":
                    this.advance();
                    return { type: TokenType.LPAREN, value: "(" };
                case ")":
                    this.advance();
                    return { type: TokenType.RPAREN, value: ")" };
                case ">":
                    if (this.peek() === "=") {
                        this.advance();
                        this.advance();
                        return { type: TokenType.GREATER_OR_EQUAL_THAN, value: ">=" };
                    } else {
                        this.advance();
                        return { type: TokenType.GREATER_THAN, value: ">" };
                    }
                case "<":
                    if (this.peek() === "=") {
                        this.advance();
                        this.advance();
                        return { type: TokenType.LESS_OR_EQUAL_THAN, value: "<=" };
                    } else {
                        this.advance();
                        return { type: TokenType.LESS_THAN, value: "<" };
                    }
                case "=":
                    this.advance();
                    return { type: TokenType.EQUAL, value: "=" };
                default:
            }

            if (this.isAlphabetic(this._currentChar)) {
                const identifier = this.readAlphanumeric();
                switch (identifier.toUpperCase()) {
                    case "PLOT":
                    case "BAR":
                    case "LINE":
                    case "SCATTER":
                    case "USING":
                    case "AS":
                    case "WHERE":
                    case "AND":
                    case "OR":
                    case "GROUPBY":
                    case "HAVING":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: TokenType.KEYWORD, value: identifier };
                        }
                    case "AVG":
                    case "COUNT":
                    case "SUM":
                        if (/[\s(]/.test(this._currentChar)) {
                            return { type: TokenType.KEYWORD, value: identifier };
                        }
                    case "NULL":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: TokenType.NULL, value: identifier };
                        }
                    default:
                        if (!this._currentChar || /[\s,)]/.test(this._currentChar)) {
                            return { type: TokenType.IDENTIFIER, value: identifier };
                        }
                }
            }
            throw new Error("Invalid character");
        }
        return { type: TokenType.EOF, value: "" };
    }

    private advance() {
        this._position++;
        this._currentChar = this._input[this._position];
    }

    private skipWhitespace() {
        while (this._currentChar && /\s/.test(this._currentChar)) {
            this.advance();
        }
    }

    private isAlphabetic(char: string) {
        return /[A-Za-z]/.test(char);
    }

    private isDigit(char: string) {
        return /[0-9]/.test(char);
    }

    private readAlphanumeric(): string {
        let result = "";
        while (this._currentChar && (this.isAlphabetic(this._currentChar) || this.isDigit(this._currentChar) || this._currentChar === "_")) {
            result += this._currentChar;
            this.advance();
        }
        return result;
    }

    private readString(): string {
        let result = "";
        while (this._currentChar !== "'") {
            if (!this._currentChar) {
                throw new Error("Unterminated string");
            }
            result += this._currentChar;
            this.advance();
        }
        this.advance(); // Consume closing quote
        return result;
    }

    private readNumber(): string {
        let result = "";
        while (this._currentChar && this.isDigit(this._currentChar)) {
            result += this._currentChar;
            this.advance();
        }
        return result;
    }
}
