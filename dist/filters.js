"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqualFilter = exports.LessThanOrEqualFilter = exports.LessThanFilter = exports.GreaterThanOrEqualFilter = exports.GreaterThanFilter = exports.OrFilter = exports.AndFilter = void 0;
class AndFilter {
    constructor(filters) {
        this.filters = filters;
    }
    satisfy(row) {
        return this.filters.every(filter => filter.satisfy(row));
    }
}
exports.AndFilter = AndFilter;
class OrFilter {
    constructor(filters) {
        this.filters = filters;
    }
    satisfy(row) {
        return this.filters.some(filter => filter.satisfy(row));
    }
}
exports.OrFilter = OrFilter;
class GreaterThanFilter {
    constructor(column, compareValue) {
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
class GreaterThanOrEqualFilter {
    constructor(column, compareValue) {
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
class LessThanFilter {
    constructor(column, compareValue) {
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
class LessThanOrEqualFilter {
    constructor(column, compareValue) {
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
class EqualFilter {
    constructor(column, compareValue) {
        this.column = column;
        this.compareValue = compareValue;
    }
    satisfy(row) {
        return row[this.column] === this.compareValue;
    }
}
exports.EqualFilter = EqualFilter;
