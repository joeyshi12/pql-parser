import { PQLParsingError } from "./exceptions";
import { Token, TokenType } from "./types";

/**
 * Lexer for tokenizing Plot Query Language (PQL) queries
 */
export class Lexer {
    private _input: string;
    private _position: number = 0;
    private _currentChar: string | null = null;

    constructor(input: string) {
        this._input = input;
        this._currentChar = this._input[this._position];
    }

    /**
     * Retrieves the current position of the lexer
     * @returns The current position of the lexer in the input string
     */
    public currentPosition() {
        return this._position;
    }

    /**
     * Peeks at the next character in the input string without advancing the lexer position
     * @returns The next character in the input string, or null if at the end of the input
     */
    public peek(): string | null {
        const peekPosition = this._position + 1;
        if (peekPosition >= this._input.length) {
            return null;
        }
        return this._input[peekPosition];
    }

    /**
     * Retrieves the next token from the input string
     * @returns The next token found in the input string
     */
    public nextToken(): Token {
        while (this._currentChar) {
            if (/\s/.test(this._currentChar)) {
                this.skipWhitespace();
                continue;
            }

            if (this.isDigit(this._currentChar)) {
                return { type: TokenType.NUMBER, value: this.readNumber() };
            }

            switch (this._currentChar) {
                case "'":
                    this.advance();
                    return { type: TokenType.STRING, value: this.readString() };
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
                        return { type: TokenType.COMPARISON_OPERATOR, value: ">=" };
                    } else {
                        this.advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: ">" };
                    }
                case "<":
                    if (this.peek() === "=") {
                        this.advance();
                        this.advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: "<=" };
                    } else {
                        this.advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: "<" };
                    }
                case "=":
                    this.advance();
                    return { type: TokenType.COMPARISON_OPERATOR, value: "=" };
                default:
            }

            if (this.isAlphabetic(this._currentChar)) {
                const identifier = this.readAlphanumeric();
                switch (identifier.toUpperCase()) {
                    case "PLOT":
                    case "USING":
                    case "AS":
                    case "WHERE":
                    case "AND":
                    case "OR":
                    case "GROUPBY":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: TokenType.KEYWORD, value: identifier.toUpperCase() };
                        }
                    case "BAR":
                    case "LINE":
                    case "SCATTER":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: TokenType.PLOT_TYPE, value: identifier.toUpperCase() };
                        }
                    case "AVG":
                    case "COUNT":
                    case "SUM":
                        if (/[\s(]/.test(this._currentChar)) {
                            return { type: TokenType.AGGREGATION_FUNCTION, value: identifier.toUpperCase() };
                        }
                    case "NULL":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: TokenType.NULL, value: identifier.toUpperCase() };
                        }
                    default:
                        // TODO: simplify this
                        if (!this._currentChar || /[\s,)]/.test(this._currentChar)) {
                            return { type: TokenType.IDENTIFIER, value: identifier };
                        }
                }
            }
            throw new PQLParsingError("Invalid character");
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
        while (this._currentChar && /[A-Za-z0-9_]/.test(this._currentChar)) {
            result += this._currentChar;
            this.advance();
        }
        return result;
    }

    private readString(): string {
        let result = "";
        while (this._currentChar !== "'") {
            if (!this._currentChar) {
                throw new PQLParsingError("Unterminated string");
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
