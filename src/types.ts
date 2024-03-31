export enum TokenType {
    KEYWORD,
    IDENTIFIER,
    PLOT_TYPE,
    LPAREN,
    RPAREN,
    COMMA,
    STRING,
    NUMBER,
    NULL,
    COMPARISON_OPERATOR,
    AGGREGATION_FUNCTION,
    EOF
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

export interface WhereFilter {}

export interface AndFilter extends WhereFilter {
    and: WhereFilter[];
}

export interface OrFilter extends WhereFilter {
    or: WhereFilter[];
}

export interface GreaterThanFilter extends WhereFilter {
    gt: { column: string, value: number };
}

export interface GreaterThanOrEqualFilter extends WhereFilter {
    gte: { column: string, value: number };
}

export interface LessThanFilter extends WhereFilter {
    lt: { column: string, value: number };
}

export interface LessThanOrEqualFilter extends WhereFilter {
    lte: { column: string, value: number };
}

export interface EqualFilter extends WhereFilter {
    eq: { column: string, value: string | number | null };
}
