import { Token } from "./types";
/**
 * Lexer for tokenizing PQL queries
 */
export declare class Lexer {
    private readonly _input;
    private _position;
    constructor(_input: string);
    /**
     * Retrieves the current position of the lexer
     * @returns The current position of the lexer in the input string
     */
    get currentPosition(): number;
    /**
     * Retrieves the current char of the lexer
     * @returns The current char of the lexer in the input string
     */
    get currentChar(): string;
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
    private _skipWhitespace;
    private _readAlphanumeric;
    private _readString;
    private _readNumber;
}
