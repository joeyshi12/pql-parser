export enum TokenType {
    KEYWORD,
    IDENTIFIER,
    LPAREN,
    RPAREN,
    COMMA,
    STRING,
    NUMBER,
    NULL,
    GREATER_THAN,
    LESS_THAN,
    GREATER_OR_EQUAL_THAN,
    LESS_OR_EQUAL_THAN,
    EQUAL,
    EOF
}

export interface Token {
    type: TokenType;
    value: string;
}
