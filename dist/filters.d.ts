import { Primitive } from "d3-array";
import { RowData } from "./types";
export declare abstract class WhereFilter {
    abstract satisfy(row: RowData): boolean;
}
export declare class AndFilter extends WhereFilter {
    readonly filters: WhereFilter[];
    constructor(filters: WhereFilter[]);
    satisfy(row: RowData): boolean;
}
export declare class OrFilter extends WhereFilter {
    readonly filters: WhereFilter[];
    constructor(filters: WhereFilter[]);
    satisfy(row: RowData): boolean;
}
export declare class GreaterThanFilter extends WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class GreaterThanOrEqualFilter extends WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class LessThanFilter extends WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class LessThanOrEqualFilter extends WhereFilter {
    readonly column: string;
    readonly compareValue: number;
    constructor(column: string, compareValue: number);
    satisfy(row: RowData): boolean;
}
export declare class EqualFilter extends WhereFilter {
    readonly column: string;
    readonly compareValue: Primitive | null;
    constructor(column: string, compareValue: Primitive | null);
    satisfy(row: RowData): boolean;
}
