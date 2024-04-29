import { Lexer } from '../src/lexer';
import { Token } from '../src/types';

test("basic plot statement", () => {
    const input = "PLOT BAR USING xcol, ycol";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with named attributes", () => {
    const input = "PLOT BAR USING xcol AS x, ycol AS y";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "KEYWORD", value: "AS" },
        { type: "IDENTIFIER", value: "x" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "KEYWORD", value: "AS" },
        { type: "IDENTIFIER", value: "y" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol = 'on'";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: "=" },
        { type: "STRING", value: "on" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol > 0";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: ">" },
        { type: "NUMBER", value: "0" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with less than or equal where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol <= 123";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "KEYWORD", value: "WHERE" },
        { type: "IDENTIFIER", value: "zcol" },
        { type: "COMPARISON_OPERATOR", value: "<=" },
        { type: "NUMBER", value: "123" },
    ]
    const actual = getTokens(lexer)
    expect(actual).toEqual(expected)
})

test("plot statement with groupby clause", () => {
    const input = "PLOT BAR USING xcol, AVG(ycol) GROUPBY xcol";
    const lexer = new Lexer(input);
    const expected = [
        { type: "KEYWORD", value: "PLOT" },
        { type: "PLOT_TYPE", value: "BAR" },
        { type: "KEYWORD", value: "USING" },
        { type: "IDENTIFIER", value: "xcol" },
        { type: "COMMA", value: "," },
        { type: "AGGREGATION_FUNCTION", value: "AVG" },
        { type: "LPAREN", value: "(" },
        { type: "IDENTIFIER", value: "ycol" },
        { type: "RPAREN", value: ")" },
        { type: "KEYWORD", value: "GROUPBY" },
        { type: "IDENTIFIER", value: "xcol" }
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
