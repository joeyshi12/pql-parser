import { Token } from "./types";
export declare class Lexer {
    private _input;
    private _position;
    private _currentChar;
    constructor(input: string);
    currentPosition(): number;
    peek(): string | null;
    nextToken(): Token;
    private advance;
    private skipWhitespace;
    private isAlphabetic;
    private isDigit;
    private readAlphanumeric;
    private readString;
    private readNumber;
}
