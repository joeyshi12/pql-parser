import { EqualFilter, GreaterThanFilter } from '../src/filters';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';

test("basic plot statement", () => {
    const input = "PLOT BAR USING xcol, ycol";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("BAR");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
});

test("plot statement with named attributes", () => {
    const input = "PLOT BAR USING xcol AS x, ycol AS y";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("BAR");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol", displayName: "x" },
        { column: "ycol", displayName: "y" },
    ]);
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol = 'on'";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("BAR");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
    if (!statement.whereFilter || !(statement.whereFilter instanceof EqualFilter)) {
        throw new Error(`Invalid where filter type ${statement.whereFilter}`);
    }
    expect(statement.whereFilter.column).toBe("zcol");
    expect(statement.whereFilter.compareValue).toBe("on");
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR USING xcol, ycol WHERE zcol > 0";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("BAR");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
    if (!statement.whereFilter || !(statement.whereFilter instanceof GreaterThanFilter)) {
        throw new Error(`Invalid where filter type ${statement.whereFilter}`);
    }
    expect(statement.whereFilter.column).toBe("zcol");
    expect(statement.whereFilter.compareValue).toBe(0);
})

test("plot statement with groupby clause", () => {
    const input = "PLOT BAR USING xcol, AVG(ycol) GROUPBY xcol";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("BAR");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol" },
        { column: "ycol", aggregationFunction: "AVG" },
    ]);
    expect(statement.groupByColumn).toBe("xcol");
})

test("plot statement with empty count aggregation", () => {
    const input = "PLOT SCATTER USING xcol, COUNT() GROUPBY xcol";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotType).toBe("SCATTER");
    expect(statement.usingAttributes).toEqual([
        { column: "xcol" },
        { aggregationFunction: "COUNT" },
    ]);
    expect(statement.groupByColumn).toBe("xcol");
})

test("regular query with invalid column", () => {
    const input = "PLOT BAR USING xcol, AVG(ycol)";
    const parser = new Parser(new Lexer(input));
    try {
        parser.parse();
        throw new Error()
    } catch {
        return;
    }
})

test("aggregation query with invalid column", () => {
    const input = "PLOT BAR USING xcol, ycol GROUPBY xcol";
    const parser = new Parser(new Lexer(input));
    try {
        parser.parse();
        throw new Error()
    } catch {
        return;
    }
})
