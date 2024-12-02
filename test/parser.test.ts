import { BarPlotCall, PointPlotCall } from '../dist';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';
import { PQLQuery } from '../src/types';

describe("parser.ts", () => {
    test("basic plot statement", () => {
        const input = "PLOT BAR(xcol, ycol)";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with named attributes", () => {
        const input = "PLOT BAR(xcol AS x, ycol AS y)";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "x"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "y"
                }
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with escaped identifiers", () => {
        const input = "PLOT BAR(` xcol `, `25`)";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: " xcol ",
                    identifier: " xcol "
                },
                valuesColumn: {
                    column: "25",
                    identifier: "25"
                }
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with string where clause", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE zcol = 'on'";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                eq: {
                    key: "zcol",
                    value: "on"
                }
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with greater than where clause", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                gt: {
                    key: "zcol",
                    value: 0
                }
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with AND where clause", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 AND zcol < 10";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                and: [
                    {
                        gt: {
                            key: "zcol",
                            value: 0
                        }
                    },
                    {
                        lt: {
                            key: "zcol",
                            value: 10
                        } 
                    }
                ]
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with OR where clause", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 OR zcol < 10";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                or: [
                    {
                        gt: {
                            key: "zcol",
                            value: 0
                        }
                    },
                    {
                        lt: {
                            key: "zcol",
                            value: 10
                        } 
                    }
                ]
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with AND and OR conditions", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE zcol > 0 OR zcol < 10 AND xcol > 0";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                or: [
                    {
                        gt: {
                            key: "zcol",
                            value: 0
                        }
                    },
                    {
                        and: [
                            {
                                lt: {
                                    key: "zcol",
                                    value: 10
                                } 
                            },
                            {
                                gt: {
                                    key: "xcol",
                                    value: 0
                                } 
                            }
                        ]
                    }
                ]
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with WHERE clause with parentheses", () => {
        const input = "PLOT BAR(xcol, ycol) WHERE (zcol > 0 OR zcol < 10) AND xcol > 0";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "ycol"
                }
            },
            whereCondition: {
                and: [
                    {
                        or: [
                            {
                                gt: {
                                    key: "zcol",
                                    value: 0
                                }
                            },
                            {
                                lt: {
                                    key: "zcol",
                                    value: 10
                                }
                            },
                        ]
                    },
                    {
                        gt: {
                            key: "xcol",
                            value: 0
                        }
                    }
                ]
            }
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with groupby clause", () => {
        const input = "PLOT BAR(xcol, AVG(ycol)) GROUPBY xcol";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <BarPlotCall>{
                plotFunction: "BAR",
                categoriesColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                valuesColumn: {
                    column: "ycol",
                    identifier: "AVG(ycol)",
                    aggregationFunction: "AVG"
                }
            },
            groupKey: "xcol"
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with empty count aggregation", () => {
        const input = "PLOT SCATTER(xcol, COUNT()) GROUPBY xcol";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <PointPlotCall>{
                plotFunction: "SCATTER",
                xColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                yColumn: {
                    identifier: "COUNT()",
                    aggregationFunction: "COUNT"
                }
            },
            groupKey: "xcol"
        };
        expect(actual).toEqual(expected);
    });

    test("plot statement with limit and offset", () => {
        const input = "PLOT SCATTER(xcol, COUNT()) GROUPBY xcol LIMIT 1 OFFSET 2";
        const actual = new Parser(new Lexer(input)).parse();
        const expected: PQLQuery = {
            plotClause: <PointPlotCall>{
                plotFunction: "SCATTER",
                xColumn: {
                    column: "xcol",
                    identifier: "xcol"
                },
                yColumn: {
                    identifier: "COUNT()",
                    aggregationFunction: "COUNT"
                }
            },
            groupKey: "xcol",
            limitAndOffset: {
                limit: 1,
                offset: 2
            }
        };
        expect(actual).toEqual(expected);
    });

    test("regular query with invalid column", () => {
        const input = "PLOT BAR(xcol, AVG(ycol))";
        const parser = new Parser(new Lexer(input));
        try {
            parser.parse();
            throw new Error()
        } catch {
            return;
        }
    });

    test("aggregation query with invalid column", () => {
        const input = "PLOT BAR(xcol, ycol) GROUPBY xcol";
        const parser = new Parser(new Lexer(input));
        try {
            parser.parse();
            throw new Error()
        } catch {
            return;
        }
    });
});
