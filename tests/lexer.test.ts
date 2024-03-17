import { Lexer, Token, TokenType } from '../src';

test("basic plot statement", () => {
    const input = "PLOT BAR USING xcol, ycol";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "BAR" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.IDENTIFIER, value: "ycol" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with named axes", () => {
    const input = "PLOT BAR USING xcol AS x, ycol AS y";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "BAR" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.KEYWORD, value: "AS" },
        { type: TokenType.IDENTIFIER, value: "x" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.KEYWORD, value: "AS" },
        { type: TokenType.IDENTIFIER, value: "y" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol = 'on'";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "BAR" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.KEYWORD, value: "WHERE" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
        { type: TokenType.EQUAL, value: "=" },
        { type: TokenType.STRING, value: "on" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol > 0";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "BAR" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.KEYWORD, value: "WHERE" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
        { type: TokenType.GREATER_THAN, value: ">" },
        { type: TokenType.NUMBER, value: "0" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with less than or equal where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol <= 123";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "BAR" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.KEYWORD, value: "WHERE" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
        { type: TokenType.LESS_OR_EQUAL_THAN, value: "<=" },
        { type: TokenType.NUMBER, value: "123" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with group by clause", () => {
    const input = "PLOT SCATTER USING xcol, AVG(ycol) GROUPBY zcol";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "SCATTER" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.KEYWORD, value: "AVG" },
        { type: TokenType.LPAREN, value: "(" },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.RPAREN, value: ")" },
        { type: TokenType.KEYWORD, value: "GROUPBY" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with having clause", () => {
    const input = "PLOT LINE USING xcol, COUNT(ycol) GROUPBY zcol HAVING zcol = 0";
    const lexer = new Lexer(input);
    const expected = [
        { type: TokenType.KEYWORD, value: "PLOT" },
        { type: TokenType.KEYWORD, value: "LINE" },
        { type: TokenType.KEYWORD, value: "USING" },
        { type: TokenType.IDENTIFIER, value: "xcol" },
        { type: TokenType.COMMA, value: "," },
        { type: TokenType.KEYWORD, value: "COUNT" },
        { type: TokenType.LPAREN, value: "(" },
        { type: TokenType.IDENTIFIER, value: "ycol" },
        { type: TokenType.RPAREN, value: ")" },
        { type: TokenType.KEYWORD, value: "GROUPBY" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
        { type: TokenType.KEYWORD, value: "HAVING" },
        { type: TokenType.IDENTIFIER, value: "zcol" },
        { type: TokenType.EQUAL, value: "=" },
        { type: TokenType.NUMBER, value: "0" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with invalid alphanumeric token", () => {
    const input = "PLOT-";
    const lexer = new Lexer(input);
    try {
        lexer.nextToken();
        fail()
    } catch {
        return;
    }
})

function getTokens(lexer: Lexer) {
    const tokens: Token[] = []
    while (lexer.peek() !== null) {
        tokens.push(lexer.nextToken());
    }
    return tokens;
}
