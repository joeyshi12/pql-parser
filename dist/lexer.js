"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const exceptions_1 = require("./exceptions");
/**
 * Lexer for tokenizing Plot Query Language (PQL) queries
 */
class Lexer {
    constructor(input) {
        this._position = 0;
        this._currentChar = null;
        this._input = input;
        this._currentChar = this._input[this._position];
    }
    /**
     * Retrieves the current position of the lexer
     * @returns The current position of the lexer in the input string
     */
    currentPosition() {
        return this._position;
    }
    /**
     * Peeks at the next character in the input string without advancing the lexer position
     * @returns The next character in the input string, or null if at the end of the input
     */
    peek() {
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
    nextToken() {
        while (this._currentChar) {
            if (/\s/.test(this._currentChar)) {
                this._skipWhitespace();
                continue;
            }
            if (this._isDigit(this._currentChar)) {
                return { type: "NUMBER", value: this._readNumber() };
            }
            switch (this._currentChar) {
                case "'":
                    this._advance();
                    return { type: "STRING", value: this._readString() };
                case ",":
                    this._advance();
                    return { type: "COMMA", value: "," };
                case "(":
                    this._advance();
                    return { type: "LPAREN", value: "(" };
                case ")":
                    this._advance();
                    return { type: "RPAREN", value: ")" };
                case ">":
                    if (this.peek() === "=") {
                        this._advance();
                        this._advance();
                        return { type: "COMPARISON_OPERATOR", value: ">=" };
                    }
                    else {
                        this._advance();
                        return { type: "COMPARISON_OPERATOR", value: ">" };
                    }
                case "<":
                    if (this.peek() === "=") {
                        this._advance();
                        this._advance();
                        return { type: "COMPARISON_OPERATOR", value: "<=" };
                    }
                    else {
                        this._advance();
                        return { type: "COMPARISON_OPERATOR", value: "<" };
                    }
                case "=":
                    this._advance();
                    return { type: "COMPARISON_OPERATOR", value: "=" };
                case "!":
                    if (this.peek() === "=") {
                        this._advance();
                        this._advance();
                        return { type: "COMPARISON_OPERATOR", value: "!=" };
                    }
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
                    case "LIMIT":
                    case "OFFSET":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: "KEYWORD", value: identifier.toUpperCase() };
                        }
                    case "BAR":
                    case "LINE":
                    case "SCATTER":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: "PLOT_TYPE", value: identifier.toUpperCase() };
                        }
                    case "MIN":
                    case "MAX":
                    case "AVG":
                    case "COUNT":
                    case "SUM":
                        if (/[\s(]/.test(this._currentChar)) {
                            return { type: "AGGREGATION_FUNCTION", value: identifier.toUpperCase() };
                        }
                    case "NULL":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: "NULL", value: identifier.toUpperCase() };
                        }
                    default:
                        // TODO: simplify this
                        if (!this._currentChar || /[\s,)]/.test(this._currentChar)) {
                            return { type: "IDENTIFIER", value: identifier };
                        }
                }
            }
            throw new exceptions_1.PQLError("Invalid character");
        }
        return { type: "EOF", value: "" };
    }
    _advance() {
        this._position++;
        this._currentChar = this._input[this._position];
    }
    _skipWhitespace() {
        while (this._currentChar && /\s/.test(this._currentChar)) {
            this._advance();
        }
    }
    _isAlphabetic(char) {
        return /[A-Za-z]/.test(char);
    }
    _isDigit(char) {
        return /[0-9]/.test(char);
    }
    _readAlphanumeric() {
        let result = "";
        while (this._currentChar && /[A-Za-z0-9_]/.test(this._currentChar)) {
            result += this._currentChar;
            this._advance();
        }
        return result;
    }
    _readString() {
        let result = "";
        while (this._currentChar !== "'") {
            if (!this._currentChar) {
                throw new exceptions_1.PQLError("Unterminated string");
            }
            result += this._currentChar;
            this._advance();
        }
        this._advance(); // Consume closing quote
        return result;
    }
    _readNumber() {
        let result = "";
        while (this._currentChar && this._isDigit(this._currentChar)) {
            result += this._currentChar;
            this._advance();
        }
        return result;
    }
}
exports.Lexer = Lexer;
