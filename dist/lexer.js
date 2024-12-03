"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const exceptions_1 = require("./exceptions");
/**
 * Lexer for tokenizing PQL queries
 */
class Lexer {
    constructor(_input) {
        this._input = _input;
        this._position = 0;
    }
    /**
     * Retrieves the current position of the lexer
     * @returns The current position of the lexer in the input string
     */
    get currentPosition() {
        return this._position;
    }
    /**
     * Retrieves the current char of the lexer
     * @returns The current char of the lexer in the input string
     */
    get currentChar() {
        return this._input[this._position];
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
        if (this.currentChar && /\s/.test(this.currentChar)) {
            this._skipWhitespace();
        }
        if (!this.currentChar) {
            return { type: "EOF", value: "" };
        }
        if (isDigit(this.currentChar)) {
            return { type: "NUMBER", value: this._readNumber() };
        }
        switch (this.currentChar) {
            case "'":
                this._position++;
                return { type: "STRING", value: this._readTo("'") };
            case "`":
                this._position++;
                return { type: "IDENTIFIER", value: this._readTo("`") };
            case ",":
                this._position++;
                return { type: "COMMA", value: "," };
            case "(":
                this._position++;
                return { type: "LPAREN", value: "(" };
            case ")":
                this._position++;
                return { type: "RPAREN", value: ")" };
            case ">":
                if (this.peek() === "=") {
                    this._position += 2;
                    return { type: "COMPARISON_OPERATOR", value: ">=" };
                }
                else {
                    this._position++;
                    return { type: "COMPARISON_OPERATOR", value: ">" };
                }
            case "<":
                if (this.peek() === "=") {
                    this._position += 2;
                    return { type: "COMPARISON_OPERATOR", value: "<=" };
                }
                else {
                    this._position++;
                    return { type: "COMPARISON_OPERATOR", value: "<" };
                }
            case "=":
                this._position++;
                return { type: "COMPARISON_OPERATOR", value: "=" };
            case "!":
                if (this.peek() === "=") {
                    this._position += 2;
                    return { type: "COMPARISON_OPERATOR", value: "!=" };
                }
            default:
        }
        if (isAlphabetic(this.currentChar)) {
            const identifier = this._readAlphanumeric();
            switch (identifier.toUpperCase()) {
                case "PLOT":
                case "AS":
                case "WHERE":
                case "GROUPBY":
                case "LIMIT":
                case "OFFSET":
                    if (!this.currentChar || this.currentChar === " ") {
                        return { type: "KEYWORD", value: identifier.toUpperCase() };
                    }
                case "AND":
                case "OR":
                    if (!this.currentChar || this.currentChar === " ") {
                        return { type: "LOGICAL_OPERATOR", value: identifier.toUpperCase() };
                    }
                case "BAR":
                case "LINE":
                case "SCATTER":
                    if (/[\s(]/.test(this.currentChar)) {
                        return { type: "PLOT_FUNCTION", value: identifier.toUpperCase() };
                    }
                case "MIN":
                case "MAX":
                case "AVG":
                case "COUNT":
                case "SUM":
                    if (/[\s(]/.test(this.currentChar)) {
                        return { type: "AGGREGATION_FUNCTION", value: identifier.toUpperCase() };
                    }
                case "NULL":
                    return { type: "NULL", value: identifier.toUpperCase() };
                default:
                    // TODO: simplify this
                    if (!this.currentChar || /[\s,)]/.test(this.currentChar)) {
                        return { type: "IDENTIFIER", value: identifier };
                    }
            }
        }
        throw new exceptions_1.PQLError(`Invalid character ${this.currentChar} at position ${this.currentPosition}`);
    }
    _skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this._position++;
        }
    }
    _readAlphanumeric() {
        let result = "";
        while (this.currentChar && /[A-Za-z0-9_]/.test(this.currentChar)) {
            result += this.currentChar;
            this._position++;
        }
        return result;
    }
    _readTo(endChar) {
        let result = "";
        while (this.currentChar !== endChar) {
            if (!this.currentChar) {
                throw new exceptions_1.PQLError("Unterminated string");
            }
            result += this.currentChar;
            this._position++;
        }
        this._position++; // Skip endChar
        return result;
    }
    _readNumber() {
        let result = "";
        while (this.currentChar && isDigit(this.currentChar)) {
            result += this.currentChar;
            this._position++;
        }
        return result;
    }
}
exports.Lexer = Lexer;
function isAlphabetic(char) {
    return /[A-Za-z]/.test(char);
}
function isDigit(char) {
    return /[0-9]/.test(char);
}
