"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
class Lexer {
    constructor(input) {
        this._position = 0;
        this._currentChar = null;
        this._input = input;
        this._currentChar = this._input[this._position];
    }
    peek() {
        const peekPosition = this._position + 1;
        if (peekPosition >= this._input.length) {
            return null;
        }
        return this._input[peekPosition];
    }
    nextToken() {
        while (this._currentChar) {
            if (/\s/.test(this._currentChar)) {
                this.skipWhitespace();
                continue;
            }
            if (this._currentChar === "'") {
                this.advance();
                return { type: token_1.TokenType.STRING, value: this.readString() };
            }
            if (this.isDigit(this._currentChar)) {
                return { type: token_1.TokenType.NUMBER, value: this.readNumber() };
            }
            switch (this._currentChar) {
                case ",":
                    this.advance();
                    return { type: token_1.TokenType.COMMA, value: "," };
                case "(":
                    this.advance();
                    return { type: token_1.TokenType.LPAREN, value: "(" };
                case ")":
                    this.advance();
                    return { type: token_1.TokenType.RPAREN, value: ")" };
                case ">":
                    if (this.peek() === "=") {
                        this.advance();
                        this.advance();
                        return { type: token_1.TokenType.GREATER_OR_EQUAL_THAN, value: ">=" };
                    }
                    else {
                        this.advance();
                        return { type: token_1.TokenType.GREATER_THAN, value: ">" };
                    }
                case "<":
                    if (this.peek() === "=") {
                        this.advance();
                        this.advance();
                        return { type: token_1.TokenType.LESS_OR_EQUAL_THAN, value: "<=" };
                    }
                    else {
                        this.advance();
                        return { type: token_1.TokenType.LESS_THAN, value: "<" };
                    }
                case "=":
                    this.advance();
                    return { type: token_1.TokenType.EQUAL, value: "=" };
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
                            return { type: token_1.TokenType.KEYWORD, value: identifier };
                        }
                    case "AVG":
                    case "COUNT":
                    case "SUM":
                        if (/[\s(]/.test(this._currentChar)) {
                            return { type: token_1.TokenType.KEYWORD, value: identifier };
                        }
                    case "NULL":
                        if (!this._currentChar || this._currentChar === " ") {
                            return { type: token_1.TokenType.NULL, value: identifier };
                        }
                    default:
                        if (!this._currentChar || /[\s,)]/.test(this._currentChar)) {
                            return { type: token_1.TokenType.IDENTIFIER, value: identifier };
                        }
                }
            }
            throw new Error("Invalid character");
        }
        return { type: token_1.TokenType.EOF, value: "" };
    }
    advance() {
        this._position++;
        this._currentChar = this._input[this._position];
    }
    skipWhitespace() {
        while (this._currentChar && /\s/.test(this._currentChar)) {
            this.advance();
        }
    }
    isAlphabetic(char) {
        return /[A-Za-z]/.test(char);
    }
    isDigit(char) {
        return /[0-9]/.test(char);
    }
    readAlphanumeric() {
        let result = "";
        while (this._currentChar && (this.isAlphabetic(this._currentChar) || this.isDigit(this._currentChar) || this._currentChar === "_")) {
            result += this._currentChar;
            this.advance();
        }
        return result;
    }
    readString() {
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
    readNumber() {
        let result = "";
        while (this._currentChar && this.isDigit(this._currentChar)) {
            result += this._currentChar;
            this.advance();
        }
        return result;
    }
}
exports.Lexer = Lexer;
