"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualFilter = exports.LessThanOrEqualFilter = exports.LessThanFilter = exports.GreaterThanOrEqualFilter = exports.GreaterThanFilter = exports.OrFilter = exports.AndFilter = exports.WhereFilter = void 0;
class WhereFilter {
}
exports.WhereFilter = WhereFilter;
class AndFilter extends WhereFilter {
    constructor(filters) {
        super();
        this.filters = filters;
    }
    satisfy(row) {
        return this.filters.every(filter => filter.satisfy(row));
    }
}
exports.AndFilter = AndFilter;
class OrFilter extends WhereFilter {
    constructor(filters) {
        super();
        this.filters = filters;
    }
    satisfy(row) {
        return this.filters.some(filter => filter.satisfy(row));
    }
}
exports.OrFilter = OrFilter;
class GreaterThanFilter extends WhereFilter {
    constructor(column, compareValue) {
        super();
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value > this.compareValue;
    }
}
exports.GreaterThanFilter = GreaterThanFilter;
class GreaterThanOrEqualFilter extends WhereFilter {
    constructor(column, compareValue) {
        super();
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value >= this.compareValue;
    }
}
exports.GreaterThanOrEqualFilter = GreaterThanOrEqualFilter;
class LessThanFilter extends WhereFilter {
    constructor(column, compareValue) {
        super();
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value < this.compareValue;
    }
}
exports.LessThanFilter = LessThanFilter;
class LessThanOrEqualFilter extends WhereFilter {
    constructor(column, compareValue) {
        super();
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        const value = Number(row[this.column]);
        if (isNaN(value)) {
            return false;
        }
        return value <= this.compareValue;
    }
}
exports.LessThanOrEqualFilter = LessThanOrEqualFilter;
class EqualFilter extends WhereFilter {
    constructor(column, compareValue) {
        super();
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        return row[this.column] === this.compareValue;
    }
}
exports.EqualFilter = EqualFilter;
