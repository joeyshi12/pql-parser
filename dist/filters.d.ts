import { RowData, Primitive } from "./types";
export interface WhereFilter {
    satisfy(row: RowData): boolean;
}
export declare class AndFilter implements WhereFilter {
    readonly filters: WhereFilter[];
    constructor(filters: WhereFilter[]);
    satisfy(row: RowData): boolean;
}
export declare class OrFilter implements WhereFilter {
    readonly filters: WhereFilter[];
    constructor(filters: WhereFilter[]);
    satisfy(row: RowData): boolean;
}
export declare class GreaterThanFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class GreaterThanOrEqualFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class LessThanFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class LessThanOrEqualFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class EqualFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: Primitive | null;
    constructor(column: string, compareValue: Primitive | null);
    satisfy(row: RowData): boolean;
}
export declare class NotEqualFilter implements WhereFilter {
    readonly column: string;
    readonly compareValue: Primitive | null;
    constructor(column: string, compareValue: Primitive | null);
    satisfy(row: RowData): boolean;
}
