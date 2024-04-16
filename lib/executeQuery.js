"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = void 0;
const d3 = __importStar(require("d3"));
const exceptions_1 = require("./exceptions");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const plots_1 = require("./plots");
function executeQuery(query, data, config) {
    const parser = new parser_1.Parser(new lexer_1.Lexer(query));
    const syntaxTree = parser.parse();
    if (syntaxTree.usingAttributes.length !== 2) {
        throw new exceptions_1.PQLError("Queries must have 2 attributes");
    }
    const columns = processData(data, syntaxTree);
    validateColumns(columns);
    return createPlot(columns[0], columns[1], syntaxTree.plotType, config);
}
exports.executeQuery = executeQuery;
function processData(data, syntaxTree) {
    if (!syntaxTree.groupByColumn) {
        return syntaxTree.usingAttributes.map(attr => {
            var _a;
            if (!attr.column) {
                throw new exceptions_1.PQLError("Column is undefined");
            }
            if (!(attr.column in data[0])) {
                throw new exceptions_1.PQLError(`Column ${attr.column} is missing from data`);
            }
            if (attr.aggregationFunction) {
                throw new exceptions_1.PQLError("Aggregation function cannot be used in query without group by clause");
            }
            return {
                name: (_a = attr.displayName) !== null && _a !== void 0 ? _a : attr.column,
                values: data.map(row => row[attr.column])
            };
        });
    }
    syntaxTree.usingAttributes.forEach(attr => {
        if (attr.column === syntaxTree.groupByColumn) {
            return;
        }
        if (!attr.aggregationFunction) {
            throw new exceptions_1.PQLError("a");
        }
        if (!attr.column && attr.aggregationFunction !== "COUNT") {
            throw new exceptions_1.PQLError("b");
        }
    });
    const groups = new Map();
    data.forEach(row => {
        const groupByValue = row[syntaxTree.groupByColumn];
        if (groups.has(groupByValue)) {
            groups.get(groupByValue).push(row);
        }
        else {
            groups.set(groupByValue, [row]);
        }
    });
    const columns = syntaxTree.usingAttributes.map(attr => {
        var _a;
        return {
            name: (_a = attr.displayName) !== null && _a !== void 0 ? _a : (attr.aggregationFunction ? `${attr.aggregationFunction}(${attr.column})` : attr.column),
            values: []
        };
    });
    groups.forEach((rows) => {
        for (let i = 0; i < columns.length; i++) {
            const aggregateValue = computeAggregateValue(rows, syntaxTree.usingAttributes[i], syntaxTree.groupByColumn);
            columns[i].values.push(aggregateValue);
        }
    });
    return columns;
}
function computeAggregateValue(data, attribute, groupByColumn) {
    switch (attribute.aggregationFunction) {
        case "AVG":
            return d3.mean(data, (row) => Number(row[attribute.column]));
        case "SUM":
            return d3.sum(data, (row) => Number(row[attribute.column]));
        case "COUNT":
            return data.length;
        default:
    }
    if (attribute.column === groupByColumn) {
        return data[0][groupByColumn];
    }
    throw new exceptions_1.PQLError(`Invalid attribute ${attribute}`);
}
function createPlot(x, y, plotType, config) {
    switch (plotType) {
        case "BAR":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => String(value));
            return (0, plots_1.barChart)(x, y, config);
        case "LINE":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => Number(value));
            return (0, plots_1.lineChart)(x, y, config);
        case "SCATTER":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => Number(value));
            return (0, plots_1.scatterPlot)(x, y, config);
        default:
            throw new exceptions_1.PQLError(`Invalid plot type ${plotType}`);
    }
}
function validateColumns(columns) {
    if (columns.length !== 2) {
        throw new exceptions_1.PQLError("Queries must contain 2 columns");
    }
    const columnSize = columns[0].values.length;
    if (columnSize === 0) {
        throw new exceptions_1.PQLError(`Column ${columns[0].name} is empty`);
    }
    for (let i = 1; i < columns.length; i++) {
        if (columnSize !== columns[i].values.length) {
            throw new exceptions_1.PQLError("Column length mismatch");
        }
    }
}
