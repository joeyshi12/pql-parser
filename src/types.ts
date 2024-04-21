export type TokenType =
    | "KEYWORD"
    | "IDENTIFIER"
    | "PLOT_TYPE"
    | "LPAREN"
    | "RPAREN"
    | "COMMA"
    | "STRING"
    | "NUMBER"
    | "NULL"
    | "COMPARISON_OPERATOR"
    | "AGGREGATION_FUNCTION"
    | "EOF";

export type PlotType =
    | "BAR"
    | "LINE"
    | "SCATTER";

export type AggregationFunction =
    | "AVG"
    | "SUM"
    | "COUNT"

export interface Token {
    type: TokenType;
    value: string;
}

export interface PQLSyntaxTree {
    plotType: PlotType;
    usingAttributes: UsingAttribute[];
    whereFilter?: WhereFilter;
    groupByColumn?: string;
}

export interface UsingAttribute {
    column?: string;
    displayName?: string;
    aggregationFunction?: AggregationFunction;
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

export interface Point {
    x: Primitive;
    y: Primitive;
}

export interface ColumnData<T> {
    name: string;
    values: T[];
}

export interface RowData {
    [key: string]: Primitive;
}

export type Primitive = string | number;

export interface PlotConfig {
    containerWidth: number;
    containerHeight: number;
    margin: PlotMargin;
}

export interface PlotMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
