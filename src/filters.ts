import { Primitive } from "d3-array";
import { RowData } from "./types";

export abstract class WhereFilter {
    public abstract satisfy(row: RowData): boolean;
}

export class AndFilter extends WhereFilter {
    constructor(public readonly filters: WhereFilter[]) {
        super();
    }

    public satisfy(row: RowData): boolean {
        return this.filters.every(filter => filter.satisfy(row))
    }
}

export class OrFilter extends WhereFilter {
    constructor(public readonly filters: WhereFilter[]) {
        super();
    }

    public satisfy(row: RowData): boolean {
        return this.filters.some(filter => filter.satisfy(row))
    }
}

export class GreaterThanFilter extends WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
        super();
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value > this.compareValue;
    }
}

export class GreaterThanOrEqualFilter extends WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
        super();
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value >= this.compareValue;
    }
}

export class LessThanFilter extends WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
        super();
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value < this.compareValue;
    }
}

export class LessThanOrEqualFilter extends WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: number) {
        super();
    }

    public satisfy(row: RowData): boolean {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value <= this.compareValue;
    }
}

export class EqualFilter extends WhereFilter {
    constructor(public readonly column: string,
                public readonly compareValue: Primitive | null) {
        super();
    }

    public satisfy(row: RowData): boolean {
        return row[this.column] === this.compareValue;
    }
}
