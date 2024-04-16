import * as d3 from "d3";
import { PQLError } from "./exceptions";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { ColumnData, PQLSyntaxTree, PlotConfig, PlotType, Primitive, RowData, UsingAttribute } from "./types";
import { barChart, lineChart, scatterPlot } from "./plots";

export function executeQuery(query: string, data: RowData[], config: PlotConfig) {
    const parser = new Parser(new Lexer(query));
    const syntaxTree = parser.parse();
    if (syntaxTree.usingAttributes.length !== 2) {
        throw new PQLError("Queries must have 2 attributes");
    }
    const columns = processData(data, syntaxTree);
    validateColumns(columns);
    return createPlot(columns[0], columns[1], syntaxTree.plotType, config);
}

function processData(data: RowData[], syntaxTree: PQLSyntaxTree): ColumnData<Primitive>[] {
    if (!syntaxTree.groupByColumn) {
        return syntaxTree.usingAttributes.map(attr => {
            if (!attr.column) {
                throw new PQLError("Column is undefined");
            }
            if (!(attr.column in data[0])) {
                throw new PQLError(`Column ${attr.column} is missing from data`);
            }
            if (attr.aggregationFunction) {
                throw new PQLError("Aggregation function cannot be used in query without group by clause");
            }
            return {
                name: attr.displayName ?? attr.column,
                values: data.map(row => row[attr.column!])
            };
        });
    }

    syntaxTree.usingAttributes.forEach(attr => {
        if (attr.column === syntaxTree.groupByColumn) {
            return;
        }
        if (!attr.aggregationFunction) {
            throw new PQLError("a");
        }
        if (!attr.column && attr.aggregationFunction !== "COUNT") {
            throw new PQLError("b");
        }
    });
    const groups: Map<Primitive, RowData[]> = new Map();
    data.forEach(row => {
        const groupByValue = row[syntaxTree.groupByColumn!];
        if (groups.has(groupByValue)) {
            groups.get(groupByValue)!.push(row);
        } else {
            groups.set(groupByValue, [row]);
        }
    });
    const columns: ColumnData<Primitive>[] = syntaxTree.usingAttributes.map(attr => {
        return {
            name: attr.displayName ?? (attr.aggregationFunction ? `${attr.aggregationFunction}(${attr.column})` : attr.column),
            values: []
        } as ColumnData<Primitive>;
    });
    groups.forEach((rows: RowData[]) => {
        for (let i = 0; i < columns.length; i++) {
            const aggregateValue = computeAggregateValue(rows, syntaxTree.usingAttributes[i], syntaxTree.groupByColumn!);
            columns[i].values.push(aggregateValue);
        }
    });
    return columns;
}

function computeAggregateValue(data: RowData[], attribute: UsingAttribute, groupByColumn: string) {
    switch (attribute.aggregationFunction) {
        case "AVG":
            return d3.mean(data, (row) => Number(row[attribute.column!]))!;
        case "SUM":
            return d3.sum(data, (row) => Number(row[attribute.column!]));
        case "COUNT":
            return data.length;
        default:
    }
    if (attribute.column === groupByColumn) {
        return data[0][groupByColumn];
    }
    throw new PQLError(`Invalid attribute ${attribute}`)
}

function createPlot(x: ColumnData<Primitive>, y: ColumnData<Primitive>, plotType: PlotType, config: PlotConfig): SVGSVGElement {
    switch (plotType) {
        case "BAR":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => String(value));
            return barChart(x as ColumnData<number>, y as ColumnData<string>, config);
        case "LINE":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => Number(value));
            return lineChart(x as ColumnData<number>, y as ColumnData<number>, config);
        case "SCATTER":
            x.values = x.values.map(value => Number(value));
            y.values = y.values.map(value => Number(value));
            return scatterPlot(x as ColumnData<number>, y as ColumnData<number>, config);
        default:
            throw new PQLError(`Invalid plot type ${plotType}`);
    }
}

function validateColumns(columns: ColumnData<Primitive>[]) {
    if (columns.length !== 2) {
        throw new PQLError("Queries must contain 2 columns");
    }
    const columnSize = columns[0].values.length;
    if (columnSize === 0) {
        throw new PQLError(`Column ${columns[0].name} is empty`);
    }
    for (let i = 1; i < columns.length; i++) {
        if (columnSize !== columns[i].values.length) {
            throw new PQLError("Column length mismatch");
        }
    }
}
