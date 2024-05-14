import { Lexer } from '../src/lexer';
import { Token } from '../src/types';

test("basic plot statement", () => {
    const input = "PLOT BAR(xcol, ycol)";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with named attributes", () => {
    const input = "PLOT BAR(xcol AS x, ycol AS y)";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "KEYWORD", value: "AS" },
        { type: "IDENTIFIER", value: "x" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "KEYWORD", value: "AS" },
        { type: "IDENTIFIER", value: "y" },
        { type: "RPAREN", value: ")" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol = 'on'";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: "=" },
        { type: "STRING", value: "on" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: ">" },
        { type: "NUMBER", value: "0" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with less than or equal where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol <= 123";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: "<=" },
        { type: "NUMBER", value: "123" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with groupby clause", () => {
    const input = "PLOT BAR(xcol, AVG(ycol)) GROUPBY xcol";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "AGGREGATION_FUNCTION", value: "AVG" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "GROUPBY" },
        { type: "IDENTIFIER", value: "xcol" }
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with limit and offset clause", () => {
    const input = "PLOT BAR(xcol, AVG(ycol)) GROUPBY xcol LIMIT 1 OFFSET 2";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "AGGREGATION_FUNCTION", value: "AVG" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "GROUPBY" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "KEYWORD", value: "LIMIT" },
        { type: "NUMBER", value: "1" },
        { type: "KEYWORD", value: "OFFSET" },
        { type: "NUMBER", value: "2" }
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
    while (true) {
        const nextToken = lexer.nextToken();
        if (nextToken.type === "EOF") {
            break;
        }
        tokens.push(nextToken);
    }
    return tokens;
}
