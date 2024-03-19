import { Token } from "./types";
/**
 * Lexer for tokenizing Plot Query Language (PQL) queries
 */
export declare class Lexer {
    private _input;
    private _position;
    private _currentChar;
    constructor(input: string);
    /**
     * Retrieves the current position of the lexer
     * @returns The current position of the lexer in the input string
     */
    currentPosition(): number;
    /**
     * Peeks at the next character in the input string without advancing the lexer position
     * @returns The next character in the input string, or null if at the end of the input
     */
    peek(): string | null;
    /**
     * Retrieves the next token from the input string
     * @returns The next token found in the input string
     */
    nextToken(): Token;
    private advance;
    private skipWhitespace;
    private isAlphabetic;
    private isDigit;
    private readAlphanumeric;
    private readString;
    private readNumber;
}
