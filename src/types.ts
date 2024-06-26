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
    | "LOGICAL_OPERATOR"
    | "AGGREGATION_FUNCTION"
    | "EOF";

export type PlotType =
    | "BAR"
    | "LINE"
    | "SCATTER";

export type AggregationFunction =
    | "MIN"
    | "MAX"
    | "AVG"
    | "SUM"
    | "COUNT"

export interface Token {
    type: TokenType;
    value: string;
}

export interface PlotCall {
    plotType: PlotType;
    args: Map<string, PlotColumn>;
}

export interface PlotColumn {
    column?: string;
    displayName?: string;
    aggregationFunction?: AggregationFunction;
}

export interface LimitAndOffset {
    limit: number;
    offset: number;
}

export type Primitive = string | number;

export interface RowData {
    [key: string]: Primitive;
}

export interface PlotConfig {
    containerWidth: number;
    containerHeight: number;
    margin: PlotMargin;
    xLabel?: string;
    yLabel?: string;
}

export interface PlotMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
