import { PQLError } from "./exceptions";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { ColumnData, PQLSyntaxTree, PlotConfig, PlotType, Point, Primitive, RowData, UsingAttribute } from "./types";
import { barChart, lineChart, scatterPlot } from "./plots";

export function executeQuery(query: string, data: RowData[], config: PlotConfig): SVGElement {
    const parser = new Parser(new Lexer(query));
    const syntaxTree = parser.parse();
    if (syntaxTree.usingAttributes.length !== 2) {
        throw new PQLError("Queries must have 2 attributes");
    }
    const points = processData(data, syntaxTree);
    return createPlot(
        points,
        syntaxTree.plotType,
        config,
        getLabel(syntaxTree.usingAttributes[0]),
        getLabel(syntaxTree.usingAttributes[1])
    );
}

function getLabel(attribute: UsingAttribute): string {
    if (attribute.displayName) {
        return attribute.displayName;
    }
    if (attribute.aggregationFunction) {
        return `${attribute.aggregationFunction}(${attribute.column})`;
    }
    return attribute.column!;
}

function processData(data: RowData[], syntaxTree: PQLSyntaxTree): Point[] {
    if (syntaxTree.usingAttributes.length !== 2) {
        throw new Error(`Invalid number of attributes ${syntaxTree.usingAttributes.length}`);
    }

    // Validate columns in syntax tree
    const columns = Object.keys(data[0]);
    syntaxTree.usingAttributes.forEach(attribute => {
        if (attribute.column && !columns.includes(attribute.column)) {
            throw new Error(`Invalid column in using attributes [${attribute.column}]\nAvailable columns:\n${columns.join("\n")}`);
        }
    });
    if (syntaxTree.groupByColumn && !columns.includes(syntaxTree.groupByColumn)) {
        throw new Error(`Invalid group by column [${syntaxTree.groupByColumn}]\nAvailable columns:\n${columns.join("\n")}`)
    }

    // Generate attribute data
    const [xAttr, yAttr] = syntaxTree.usingAttributes;
    let x: Primitive[];
    let y: Primitive[];
    if (!syntaxTree.groupByColumn) {
        x = data.map(row => row[xAttr.column!]);
        y = data.map(row => row[yAttr.column!]);
    } else {
        const groups: Map<Primitive, any[]> = new Map();
        data.forEach(row => {
            const groupByValue = row[syntaxTree.groupByColumn!];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue)!.push(row);
            } else {
                groups.set(groupByValue, [row]);
            }
        });
        x = [];
        y = [];
        groups.forEach((rows: RowData[], _) => {
            x.push(computeAggregateValue(rows, xAttr, syntaxTree.groupByColumn!));
            y.push(computeAggregateValue(rows, yAttr, syntaxTree.groupByColumn!));
        });
    }
    return x.map((x, i) => ({ x: x, y: y[i] }));
}

function computeAggregateValue(data: RowData[], attribute: UsingAttribute, groupByColumn: string) {
    switch (attribute.aggregationFunction) {
        case "AVG":
            return columnSum(data, attribute.column!);
        case "SUM":
            return columnSum(data, attribute.column!) / data.length;
        case "COUNT":
            return data.length;
        default:
    }
    if (attribute.column === groupByColumn) {
        return data[0][groupByColumn];
    }
    throw new PQLError(`Invalid attribute ${attribute}`)
}

function columnSum(data: RowData[], column: string) {
    let result = 0;
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN) {
            result += value;
        }
    }
    return result
}

function createPlot(points: Point[], plotType: PlotType, config: PlotConfig, xLabel: string, yLabel: string): SVGElement {
    switch (plotType) {
        case "BAR":
            points.sort((p1, p2) => Number(p2.x) - Number(p1.x));
            points = points.slice(0, 20);
            points.reverse();
            const barX: ColumnData<number> = { name: xLabel, values: points.map(point => Number(point.x)) };
            const barY: ColumnData<string> = { name: yLabel, values: points.map(point => String(point.y)) };
            return barChart(barX, barY, config);
        case "LINE":
            points.sort((p1, p2) => Number(p2.x) - Number(p1.x));
            const lineX: ColumnData<number> = { name: xLabel, values: points.map(point => Number(point.x)) };
            const lineY: ColumnData<number> = { name: yLabel, values: points.map(point => Number(point.y)) };
            return lineChart(lineX, lineY, config);
        case "SCATTER":
            const scatterX: ColumnData<number> = { name: xLabel, values: points.map(point => Number(point.x)) };
            const scatterY: ColumnData<number> = { name: yLabel, values: points.map(point => Number(point.y)) };
            return scatterPlot(scatterX, scatterY, config);
        default:
            throw new PQLError(`Invalid plot type ${plotType}`);
    }
}
