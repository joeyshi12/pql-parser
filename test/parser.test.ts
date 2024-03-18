import { Lexer, Parser } from '../src';
import { PQLSyntaxTree } from '../src/types';

test("basic plot statement", () => {
    const input = "PLOT BAR USING xcol, ycol";
    const parser = new Parser(new Lexer(input));
    const expected: PQLSyntaxTree = {
        plotType: "BAR",
        usingAttributes: [
            { column: "xcol" },
            { column: "ycol" },
        ]
    }
    expect(parser.parse()).toEqual(expected);
});

test("plot statement with named attributes", () => {
    const input = "PLOT BAR USING xcol AS x, ycol AS y";
    const parser = new Parser(new Lexer(input));
    const expected: PQLSyntaxTree = {
        plotType: "BAR",
        usingAttributes: [
            { column: "xcol", displayName: "x" },
            { column: "ycol", displayName: "y" },
        ]
    }
    expect(parser.parse()).toEqual(expected);
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol = 'on'";
    const parser = new Parser(new Lexer(input));
    const expected: PQLSyntaxTree = {
        plotType: "BAR",
        usingAttributes: [
            { column: "xcol" },
            { column: "ycol" },
        ],
        whereFilter: {
            eq: { column: "zcol", value: "on" }
        }
    }
    expect(parser.parse()).toEqual(expected)
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol > 0";
    const parser = new Parser(new Lexer(input));
    const expected: PQLSyntaxTree = {
        plotType: "BAR",
        usingAttributes: [
            { column: "xcol" },
            { column: "ycol" },
        ],
        whereFilter: {
            gt: { column: "zcol", value: 0 }
        }
    }
    expect(parser.parse()).toEqual(expected)
})
