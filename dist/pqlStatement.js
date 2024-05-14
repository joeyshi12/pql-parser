"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PQLStatement = void 0;
const exceptions_1 = require("./exceptions");
const plots_1 = require("./plots");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
class PQLStatement {
    constructor(plotCall, whereFilter, groupByColumn, limitAndOffset) {
        this.plotCall = plotCall;
        this.whereFilter = whereFilter;
        this.groupByColumn = groupByColumn;
        this.limitAndOffset = limitAndOffset;
    }
    static create(query) {
        return new parser_1.Parser(new lexer_1.Lexer(query)).parse();
    }
    execute(data, config) {
        const filteredData = this.whereFilter ? data.filter(row => { var _a; return (_a = this.whereFilter) === null || _a === void 0 ? void 0 : _a.satisfy(row); }) : data;
        const columnDataMap = this._processData(filteredData);
        switch (this.plotCall.plotType) {
            case "BAR":
                return this._createBarChart(columnDataMap, config);
            case "LINE":
                return this._createXYPlot(columnDataMap, config);
            case "SCATTER":
                return this._createXYPlot(columnDataMap, config, true);
            default:
                throw new exceptions_1.PQLError(`Invalid plot type ${this.plotCall}`);
        }
    }
    _processData(data) {
        const columnDataMap = new Map();
        if (!this.groupByColumn) {
            this.plotCall.args.forEach((plotColumn, name) => {
                columnDataMap.set(name, data.map(row => row[plotColumn.column]));
            });
            return columnDataMap;
        }
        const groups = new Map();
        for (let row of data) {
            const groupByValue = row[this.groupByColumn];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue).push(row);
            }
            else {
                groups.set(groupByValue, [row]);
            }
        }
        const groupEntries = Array.from(groups.entries());
        for (let [name, plotColumn] of this.plotCall.args) {
            columnDataMap.set(name, this._computeAggregatedColumn(groupEntries, plotColumn));
        }
        return columnDataMap;
    }
    _computeAggregatedColumn(groupEntries, plotColumn) {
        switch (plotColumn.aggregationFunction) {
            case "MIN":
                return groupEntries.map(([_, rows]) => columnMin(rows, plotColumn.column));
            case "MAX":
                return groupEntries.map(([_, rows]) => columnMax(rows, plotColumn.column));
            case "AVG":
                return groupEntries.map(([_, rows]) => columnSum(rows, plotColumn.column) / rows.length);
            case "SUM":
                return groupEntries.map(([_, rows]) => columnSum(rows, plotColumn.column));
            case "COUNT":
                return groupEntries.map(([_, rows]) => rows.length);
            case undefined:
                if (plotColumn.column === this.groupByColumn) {
                    return groupEntries.map(([key, _]) => key);
                }
            default:
                throw new exceptions_1.PQLError(`Invalid aggregation function type ${plotColumn.aggregationFunction}`);
        }
    }
    _createBarChart(columnDataMap, config) {
        const categoryColumn = this.plotCall.args.get("categories");
        const valuesColumn = this.plotCall.args.get("values");
        if (!categoryColumn || !valuesColumn) {
            throw new exceptions_1.PQLError("Missing category or values column");
        }
        if (!config.xLabel) {
            config.xLabel = getLabel(valuesColumn);
        }
        if (!config.yLabel) {
            config.yLabel = getLabel(categoryColumn);
        }
        const categories = columnDataMap.get("categories");
        const values = columnDataMap.get("values");
        if (!categories || !values) {
            throw new exceptions_1.PQLError("Missing category or values data");
        }
        let points = categories.map((category, i) => [String(category), Number(values[i])])
            .filter(([_, value]) => !isNaN(value));
        points.sort((p1, p2) => p2[1] - p1[1]);
        if (this.limitAndOffset) {
            points = points.slice(this.limitAndOffset.offset, this.limitAndOffset.offset + this.limitAndOffset.limit);
        }
        points.reverse();
        return (0, plots_1.barChart)(points, config);
    }
    _createXYPlot(columnDataMap, config, isScatter = false) {
        const xColumn = this.plotCall.args.get("x");
        const yColumn = this.plotCall.args.get("y");
        if (!xColumn || !yColumn) {
            throw new exceptions_1.PQLError("Missing x or y column");
        }
        if (!config.xLabel) {
            config.xLabel = getLabel(xColumn);
        }
        if (!config.yLabel) {
            config.yLabel = getLabel(yColumn);
        }
        const xData = columnDataMap.get("x");
        const yData = columnDataMap.get("y");
        if (!xData || !yData) {
            throw new exceptions_1.PQLError("Missing x or y data");
        }
        let points = xData.map((x, i) => [Number(x), Number(yData[i])])
            .filter(([x, y]) => !isNaN(x) && !isNaN(y));
        points.sort((p1, p2) => p1[0] - p2[0]);
        if (this.limitAndOffset) {
            points = points.slice(this.limitAndOffset.offset, this.limitAndOffset.offset + this.limitAndOffset.limit);
        }
        return isScatter ? (0, plots_1.scatterPlot)(points, config) : (0, plots_1.lineChart)(points, config);
    }
}
exports.PQLStatement = PQLStatement;
function columnMin(data, column) {
    let result = null;
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value) && ((result !== null && value < result) || result === null)) {
            result = value;
        }
    }
    if (result === null) {
        throw new exceptions_1.PQLError(`Failed to compute MIN of empty column ${column}`);
    }
    return result;
}
function columnMax(data, column) {
    let result = null;
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value) && ((result !== null && value > result) || result === null)) {
            result = value;
        }
    }
    if (result === null) {
        throw new exceptions_1.PQLError(`Failed to compute MAX of empty column ${column}`);
    }
    return result;
}
function columnSum(data, column) {
    let result = 0;
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value)) {
            result += value;
        }
    }
    return result;
}
function getLabel(attribute) {
    if (attribute.displayName) {
        return attribute.displayName;
    }
    if (attribute.aggregationFunction === "COUNT") {
        return "COUNT()";
    }
    if (attribute.aggregationFunction) {
        return `${attribute.aggregationFunction}(${attribute.column})`;
    }
    return attribute.column;
}
