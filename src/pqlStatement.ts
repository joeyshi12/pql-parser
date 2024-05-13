import { PQLError } from "./exceptions";
import { LimitAndOffset, PlotConfig, Primitive, RowData, PlotColumn, PlotCall } from "./types";
import { barChart, lineChart, scatterPlot } from "./plots";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { WhereFilter } from "./filters";

export class PQLStatement {
    constructor(public readonly plotCall: PlotCall,
                public readonly whereFilter?: WhereFilter,
                public readonly groupByColumn?: string,
                public readonly limitAndOffset?: LimitAndOffset) {
    }

    public static create(query: string) {
        return new Parser(new Lexer(query)).parse();
    }

    public execute(data: RowData[], config: PlotConfig): SVGSVGElement {
        const filteredData = this.whereFilter ? data.filter(row => this.whereFilter?.satisfy(row)) : data;
        const columnDataMap = this._processData(filteredData);
        return this._createPlot(columnDataMap, config);
    }

    private _processData(data: RowData[]): Map<string, Primitive[]> {
        const columnDataMap: Map<string, Primitive[]> = new Map();

        if (!this.groupByColumn) {
            this.plotCall.args.forEach((plotColumn, name) => {
                columnDataMap.set(name, data.map(row => row[plotColumn.column!]));
            });
        }

        const groups: Map<Primitive, RowData[]> = new Map();
        data.forEach(row => {
            const groupByValue = row[this.groupByColumn!];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue)!.push(row);
            } else {
                groups.set(groupByValue, [row]);
            }
        });

        this.plotCall.args.forEach((plotColumn, name) => {
            const values: Primitive[] = [];
            groups.forEach((rows: RowData[], _) => {
                values.push(computeAggregateValue(rows, plotColumn, this.groupByColumn!));
            });
            columnDataMap.set(name, values);
        });

        return columnDataMap;
    }

    private _createPlot(columnDataMap: Map<string, Primitive[]>, config: PlotConfig): SVGSVGElement {
        switch (this.plotCall.plotType) {
            case "BAR":
                let barChartPoints: [number, string][] = columnDataMap
                    .map(point => ({ x: Number(point.x), y: String(point.y) }))
                    .filter(point => !isNaN(point.x));
                const categorySet: Set<string> = new Set();
                for (let point of barChartPoints) {
                    if (categorySet.has(point.y)) {
                        throw new PQLError(`Duplicate bar chart category ${point.y} found in data - use GROUPBY with category column to fix`);
                    }
                    categorySet.add(point.y);
                }
                barChartPoints.sort((p1, p2) => p2.x - p1.x);
                barChartPoints = this._slicePoints(barChartPoints);
                barChartPoints.reverse();
                return barChart(barChartPoints, config);
            case "LINE":
                const lineChartPoints: Point<number, number>[] = columnDataMap
                    .map(point => ({ x: Number(point.x), y: Number(point.y) }))
                    .filter(point => !isNaN(point.x) && !isNaN(point.y));
                lineChartPoints.sort((p1, p2) => p1.x - p2.x);
                return lineChart(this._slicePoints(lineChartPoints), config);
            case "SCATTER":
                const scatterPlotPoints: Point<number, number>[] = columnDataMap
                    .map(point => ({ x: Number(point.x), y: Number(point.y) }))
                    .filter(point => !isNaN(point.x) && !isNaN(point.y));
                scatterPlotPoints.sort((p1, p2) => p1.x - p2.x);
                return scatterPlot(this._slicePoints(scatterPlotPoints), config);
            default:
                throw new PQLError(`Invalid plot type ${this.plotCall}`);
        }
    }

    private _createBarChart()

    private _slicePoints<PrimitiveX extends Primitive, PrimitiveY extends Primitive>(points: Point<PrimitiveX, PrimitiveY>[]): Point<PrimitiveX, PrimitiveY>[] {
        if (!this.limitAndOffset) {
            return points;
        }
        return points.slice(
            this.limitAndOffset.offset,
            this.limitAndOffset.offset + this.limitAndOffset.limit
        );
    }
}

function computeAggregateValue(data: RowData[], attribute: PlotColumn, groupByColumn: string) {
    switch (attribute.aggregationFunction) {
        case "MIN":
            return columnMin(data, attribute.column!);
        case "MAX":
            return columnMax(data, attribute.column!)
        case "AVG":
            return columnSum(data, attribute.column!) / data.length;
        case "SUM":
            return columnSum(data, attribute.column!);
        case "COUNT":
            return data.length;
        default:
    }
    if (attribute.column === groupByColumn) {
        return data[0][groupByColumn];
    }
    throw new PQLError(`Invalid attribute ${attribute}`)
}

function columnMin(data: RowData[], column: string): number {
    let result = null
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value) && ((result !== null && value < result) || result === null)) {
            result = value;
        }
    }
    if (result === null) {
        throw new PQLError(`Failed to compute MIN of empty column ${column}`)
    }
    return result;
}

function columnMax(data: RowData[], column: string): number {
    let result = null
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value) && ((result !== null && value > result) || result === null)) {
            result = value;
        }
    }
    if (result === null) {
        throw new PQLError(`Failed to compute MAX of empty column ${column}`)
    }
    return result;
}

function columnSum(data: RowData[], column: string) {
    let result = 0;
    for (let row of data) {
        const value = Number(row[column]);
        if (!isNaN(value)) {
            result += value;
        }
    }
    return result
}

function getLabel(attribute: PlotColumn): string {
    if (attribute.displayName) {
        return attribute.displayName;
    }
    if (attribute.aggregationFunction === "COUNT") {
        return "COUNT()";
    }
    if (attribute.aggregationFunction) {
        return `${attribute.aggregationFunction}(${attribute.column})`;
    }
    return attribute.column!;
}
