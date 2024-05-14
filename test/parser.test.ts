import { AndFilter, LessThanFilter, OrFilter } from '../dist';
import { EqualFilter, GreaterThanFilter } from '../src/filters';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';

test("basic plot statement", () => {
    const input = "PLOT BAR(xcol, ycol)";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
});

test("plot statement with named attributes", () => {
    const input = "PLOT BAR(xcol AS x, ycol AS y)";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol", displayName: "x" },
        { column: "ycol", displayName: "y" },
    ]);
});

test("plot statement with string where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol = 'on'";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
    const equalFilter = <EqualFilter>statement.whereFilter;
    expect(equalFilter.column).toBe("zcol");
    expect(equalFilter.compareValue).toBe("on");
})

test("plot statement with greater than where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);
    const greaterThanFilter = <GreaterThanFilter>statement.whereFilter;
    expect(greaterThanFilter.column).toBe("zcol");
    expect(greaterThanFilter.compareValue).toBe(0);
})

test("plot statement with AND where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 AND zcol < 10";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);

    const andFilter = <AndFilter>statement.whereFilter;

    expect(andFilter.filters.length).toBe(2);

    const greaterThanFilter = <GreaterThanFilter>andFilter.filters[0];
    expect(greaterThanFilter.column).toBe("zcol");
    expect(greaterThanFilter.compareValue).toBe(0);

    const lessThanFilter = <LessThanFilter>andFilter.filters[1];
    expect(lessThanFilter.column).toBe("zcol");
    expect(lessThanFilter.compareValue).toBe(10);
})

test("plot statement with OR where clause", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 OR zcol < 10";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);

    const andFilter = <OrFilter>statement.whereFilter;

    expect(andFilter.filters.length).toBe(2);

    const greaterThanFilter = <GreaterThanFilter>andFilter.filters[0];
    expect(greaterThanFilter.column).toBe("zcol");
    expect(greaterThanFilter.compareValue).toBe(0);

    const lessThanFilter = <LessThanFilter>andFilter.filters[1];
    expect(lessThanFilter.column).toBe("zcol");
    expect(lessThanFilter.compareValue).toBe(10);
})

test("plot statement with AND and OR conditions", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 OR zcol < 10 AND xcol > 0";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);

    const orFilter = <OrFilter>statement.whereFilter;
    expect(orFilter.filters.length).toBe(2);

    const greaterThanFilter = <GreaterThanFilter>orFilter.filters[0];
    expect(greaterThanFilter.column).toBe("zcol");
    expect(greaterThanFilter.compareValue).toBe(0);

    const andFilter = <AndFilter>orFilter.filters[1];
    expect(andFilter.filters.length).toBe(2);
    const filter1 = <LessThanFilter>andFilter.filters[0];
    expect(filter1.column).toBe("zcol");
    expect(filter1.compareValue).toBe(10);
    const filter2 = <GreaterThanFilter>andFilter.filters[1];
    expect(filter2.column).toBe("xcol");
    expect(filter2.compareValue).toBe(0);
})

test("plot statement with WHERE clause with parentheses", () => {
    const input = "PLOT BAR(xcol, ycol) WHERE (zcol > 0 OR zcol < 10) AND xcol > 0";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol" },
    ]);

    const andFilter = <AndFilter>statement.whereFilter;
    expect(andFilter.filters.length).toBe(2);

    const orFilter = <OrFilter>andFilter.filters[0];
    expect(orFilter.filters.length).toBe(2);
    const filter1 = <GreaterThanFilter>orFilter.filters[0];
    expect(filter1.column).toBe("zcol");
    expect(filter1.compareValue).toBe(0);
    const filter2 = <LessThanFilter>orFilter.filters[1];
    expect(filter2.column).toBe("zcol");
    expect(filter2.compareValue).toBe(10);

    const greaterThanFilter = <GreaterThanFilter>andFilter.filters[1];
    expect(greaterThanFilter.column).toBe("xcol");
    expect(greaterThanFilter.compareValue).toBe(0);
})

test("plot statement with groupby clause", () => {
    const input = "PLOT BAR(xcol, AVG(ycol)) GROUPBY xcol";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("BAR");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { column: "ycol", aggregationFunction: "AVG" },
    ]);
    expect(statement.groupByColumn).toBe("xcol");
})

test("plot statement with empty count aggregation", () => {
    const input = "PLOT SCATTER(xcol, COUNT()) GROUPBY xcol";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("SCATTER");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { aggregationFunction: "COUNT" },
    ]);
    expect(statement.groupByColumn).toBe("xcol");
})

test("plot statement with limit and offset", () => {
    const input = "PLOT SCATTER(xcol, COUNT()) GROUPBY xcol LIMIT 1 OFFSET 2";
    const statement = new Parser(new Lexer(input)).parse();
    expect(statement.plotCall.plotType).toBe("SCATTER");
    expect(Array.from(statement.plotCall.args.values())).toEqual([
        { column: "xcol" },
        { aggregationFunction: "COUNT" },
    ]);
    expect(statement.groupByColumn).toBe("xcol");
    expect(statement.limitAndOffset).toEqual({ limit: 1, offset: 2 });
})

test("regular query with invalid column", () => {
    const input = "PLOT BAR(xcol, AVG(ycol))";
    const parser = new Parser(new Lexer(input));
    try {
        parser.parse();
        throw new Error()
    } catch {
        return;
    }
})

test("aggregation query with invalid column", () => {
    const input = "PLOT BAR(xcol, ycol) GROUPBY xcol";
    const parser = new Parser(new Lexer(input));
    try {
        parser.parse();
        throw new Error()
    } catch {
        return;
    }
})
