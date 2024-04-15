import { PQLError } from "./exceptions";
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
                this._skipWhitespace();
                continue;
            }

            if (this._isDigit(this._currentChar)) {
                return { type: TokenType.NUMBER, value: this._readNumber() };
            }

            switch (this._currentChar) {
                case "'":
                    this._advance();
                    return { type: TokenType.STRING, value: this._readString() };
                case ",":
                    this._advance();
                    return { type: TokenType.COMMA, value: "," };
                case "(":
                    this._advance();
                    return { type: TokenType.LPAREN, value: "(" };
                case ")":
                    this._advance();
                    return { type: TokenType.RPAREN, value: ")" };
                case ">":
                    if (this.peek() === "=") {
                        this._advance();
                        this._advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: ">=" };
                    } else {
                        this._advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: ">" };
                    }
                case "<":
                    if (this.peek() === "=") {
                        this._advance();
                        this._advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: "<=" };
                    } else {
                        this._advance();
                        return { type: TokenType.COMPARISON_OPERATOR, value: "<" };
                    }
                case "=":
                    this._advance();
                    return { type: TokenType.COMPARISON_OPERATOR, value: "=" };
                default:
            }

            if (this._isAlphabetic(this._currentChar)) {
                const identifier = this._readAlphanumeric();
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
            throw new PQLError("Invalid character");
        }
        return { type: TokenType.EOF, value: "" };
    }

    private _advance() {
        this._position++;
        this._currentChar = this._input[this._position];
    }

    private _skipWhitespace() {
        while (this._currentChar && /\s/.test(this._currentChar)) {
            this._advance();
        }
    }

    private _isAlphabetic(char: string) {
        return /[A-Za-z]/.test(char);
    }

    private _isDigit(char: string) {
        return /[0-9]/.test(char);
    }

    private _readAlphanumeric(): string {
        let result = "";
        while (this._currentChar && /[A-Za-z0-9_]/.test(this._currentChar)) {
            result += this._currentChar;
            this._advance();
        }
        return result;
    }

    private _readString(): string {
        let result = "";
        while (this._currentChar !== "'") {
            if (!this._currentChar) {
                throw new PQLError("Unterminated string");
            }
            result += this._currentChar;
            this._advance();
        }
        this._advance(); // Consume closing quote
        return result;
    }

    private _readNumber(): string {
        let result = "";
        while (this._currentChar && this._isDigit(this._currentChar)) {
            result += this._currentChar;
            this._advance();
        }
        return result;
    }
}
