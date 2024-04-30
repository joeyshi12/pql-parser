import { RowData, Primitive } from "./types";

export interface WhereFilter {
    satisfy(row: RowData): boolean;
}

export class AndFilter implements WhereFilter {
    constructor(public readonly filters: WhereFilter[]) {
    }

    public satisfy(row: RowData): boolean {
        return this.filters.every(filter => filter.satisfy(row))
    }
}

export class OrFilter implements WhereFilter {
    constructor(public readonly filters: WhereFilter[]) {
    }

    public satisfy(row: RowData): boolean {
        return this.filters.some(filter => filter.satisfy(row))
    }
}

export class GreaterThanFilter implements WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value > this.compareValue;
    }
}

export class GreaterThanOrEqualFilter implements WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value >= this.compareValue;
    }
}

export class LessThanFilter implements WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value < this.compareValue;
    }
}

export class LessThanOrEqualFilter implements WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value <= this.compareValue;
    }
}

export class EqualFilter implements WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: Primitive | null) {
    }

    public satisfy(row: RowData): boolean {
        return row[this.column] === this.compareValue;
    }
}
