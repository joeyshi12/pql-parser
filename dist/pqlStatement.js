"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PQLStatement = void 0;
const exceptions_1 = require("./exceptions");
const plots_1 = require("./plots");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
class PQLStatement {
    constructor(plotType, usingAttributes, whereFilter, groupByColumn, limitAndOffset) {
        this.plotType = plotType;
        this.usingAttributes = usingAttributes;
        this.whereFilter = whereFilter;
        this.groupByColumn = groupByColumn;
        this.limitAndOffset = limitAndOffset;
    }
    static create(query) {
        return new parser_1.Parser(new lexer_1.Lexer(query)).parse();
    }
    execute(data, config) {
        if (this.usingAttributes.length !== 2) {
            throw new exceptions_1.PQLError("Queries must have 2 attributes");
        }
        const filteredData = this.whereFilter ? data.filter(row => { var _a; return (_a = this.whereFilter) === null || _a === void 0 ? void 0 : _a.satisfy(row); }) : data;
        const points = this._processData(filteredData);
        if (!config.xLabel) {
            config.xLabel = getLabel(this.usingAttributes[0]);
        }
        if (!config.yLabel) {
            config.yLabel = getLabel(this.usingAttributes[1]);
        }
        return this._createPlot(points, config);
    }
    _processData(data) {
        if (this.usingAttributes.length !== 2) {
            throw new Error(`Invalid number of attributes ${this.usingAttributes.length}`);
        }
        const [xAttr, yAttr] = this.usingAttributes;
        if (!this.groupByColumn) {
            return data.map(row => ({ x: row[xAttr.column], y: row[yAttr.column] }));
        }
        const groups = new Map();
        data.forEach(row => {
            const groupByValue = row[this.groupByColumn];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue).push(row);
            }
            else {
                groups.set(groupByValue, [row]);
            }
        });
        const x = [];
        const y = [];
        groups.forEach((rows, _) => {
            x.push(computeAggregateValue(rows, xAttr, this.groupByColumn));
            y.push(computeAggregateValue(rows, yAttr, this.groupByColumn));
        });
        return x.map((x, i) => ({ x: x, y: y[i] }));
    }
    _createPlot(points, config) {
        switch (this.plotType) {
            case "BAR":
                let barChartPoints = points
                    .map(point => ({ x: Number(point.x), y: String(point.y) }))
                    .filter(point => !isNaN(point.x));
                const categorySet = new Set();
                for (let point of barChartPoints) {
                    if (categorySet.has(point.y)) {
                        throw new exceptions_1.PQLError(`Duplicate bar chart category ${point.y} found in data - use GROUPBY with category column to fix`);
                    }
                    categorySet.add(point.y);
                }
                barChartPoints.sort((p1, p2) => p2.x - p1.x);
                barChartPoints = this._slicePoints(barChartPoints);
                barChartPoints.reverse();
                return (0, plots_1.barChart)(barChartPoints, config);
            case "LINE":
                const lineChartPoints = points
                    .map(point => ({ x: Number(point.x), y: Number(point.y) }))
                    .filter(point => !isNaN(point.x) && !isNaN(point.y));
                lineChartPoints.sort((p1, p2) => p1.x - p2.x);
                return (0, plots_1.lineChart)(this._slicePoints(lineChartPoints), config);
            case "SCATTER":
                const scatterPlotPoints = points
                    .map(point => ({ x: Number(point.x), y: Number(point.y) }))
                    .filter(point => !isNaN(point.x) && !isNaN(point.y));
                scatterPlotPoints.sort((p1, p2) => p1.x - p2.x);
                return (0, plots_1.scatterPlot)(this._slicePoints(scatterPlotPoints), config);
            default:
                throw new exceptions_1.PQLError(`Invalid plot type ${this.plotType}`);
        }
    }
    _slicePoints(points) {
        if (!this.limitAndOffset) {
            return points;
        }
        return points.slice(this.limitAndOffset.offset, this.limitAndOffset.offset + this.limitAndOffset.limit);
    }
}
exports.PQLStatement = PQLStatement;
function computeAggregateValue(data, attribute, groupByColumn) {
    switch (attribute.aggregationFunction) {
        case "MIN":
            return columnMin(data, attribute.column);
        case "MAX":
            return columnMax(data, attribute.column);
        case "AVG":
            return columnSum(data, attribute.column) / data.length;
        case "SUM":
            return columnSum(data, attribute.column);
        case "COUNT":
            return data.length;
        default:
    }
    if (attribute.column === groupByColumn) {
        return data[0][groupByColumn];
    }
    throw new exceptions_1.PQLError(`Invalid attribute ${attribute}`);
}
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
