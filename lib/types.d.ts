export declare enum TokenType {
    KEYWORD = 0,
    IDENTIFIER = 1,
    PLOT_TYPE = 2,
    LPAREN = 3,
    RPAREN = 4,
    COMMA = 5,
    STRING = 6,
    NUMBER = 7,
    NULL = 8,
    COMPARISON_OPERATOR = 9,
    AGGREGATION_FUNCTION = 10,
    EOF = 11
}
export interface Token {
    type: TokenType;
    value: string;
}
export interface PQLSyntaxTree {
    plotType: string;
    usingAttributes: UsingAttribute[];
    whereFilter?: WhereFilter;
    groupByColumn?: string;
}
export interface UsingAttribute {
    column?: string;
    displayName?: string;
    aggregationFunction?: string;
}
export interface WhereFilter {
}
export interface AndFilter extends WhereFilter {
    and: WhereFilter[];
}
export interface OrFilter extends WhereFilter {
    or: WhereFilter[];
}
export interface GreaterThanFilter extends WhereFilter {
    gt: {
        column: string;
        value: number;
    };
}
export interface GreaterThanOrEqualFilter extends WhereFilter {
    gte: {
        column: string;
        value: number;
    };
}
export interface LessThanFilter extends WhereFilter {
    lt: {
        column: string;
        value: number;
    };
}
export interface LessThanOrEqualFilter extends WhereFilter {
    lte: {
        column: string;
        value: number;
    };
}
export interface EqualFilter extends WhereFilter {
    eq: {
        column: string;
        value: string | number | null;
    };
}
