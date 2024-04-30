import { PQLError } from "./exceptions";
import { LimitAndOffset, PlotConfig, PlotType, Point, Primitive, RowData, UsingAttribute } from "./types";
import { barChart, lineChart, scatterPlot } from "./plots";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { WhereFilter } from "./filters";

export class PQLStatement {
    constructor(public readonly plotType: PlotType,
                public readonly usingAttributes: UsingAttribute[],
                public readonly whereFilter?: WhereFilter,
                public readonly groupByColumn?: string,
                public readonly limitAndOffset?: LimitAndOffset) {
    }

    public static create(query: string) {
        return new Parser(new Lexer(query)).parse();
    }

    public execute(data: RowData[], config: PlotConfig): SVGSVGElement {
        if (this.usingAttributes.length !== 2) {
            throw new PQLError("Queries must have 2 attributes");
        }
        const filteredData = this.whereFilter ? data.filter(row => this.whereFilter?.satisfy(row)) : data;
        const points = this._processData(filteredData);
        if (!config.xLabel) {
            config.xLabel = getLabel(this.usingAttributes[0]);
        }
        if (!config.yLabel) {
            config.yLabel = getLabel(this.usingAttributes[1]);
        }
        return this._createPlot(points, config);
    }

    private _processData(data: RowData[]): Point<Primitive, Primitive>[] {
        if (this.usingAttributes.length !== 2) {
            throw new Error(`Invalid number of attributes ${this.usingAttributes.length}`);
        }

        const [xAttr, yAttr] = this.usingAttributes;
        if (!this.groupByColumn) {
            return data.map(row => ({ x: row[xAttr.column!], y: row[yAttr.column!] }))
        }

        const groups: Map<Primitive, any[]> = new Map();
        data.forEach(row => {
            const groupByValue = row[this.groupByColumn!];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue)!.push(row);
            } else {
                groups.set(groupByValue, [row]);
            }
        });
        const x: Primitive[] = [];
        const y: Primitive[] = [];
        groups.forEach((rows: RowData[], _) => {
            x.push(computeAggregateValue(rows, xAttr, this.groupByColumn!));
            y.push(computeAggregateValue(rows, yAttr, this.groupByColumn!));
        });
        return x.map((x, i) => ({ x: x, y: y[i] }));
    }

    private _createPlot(points: Point<Primitive, Primitive>[], config: PlotConfig): SVGSVGElement {
        switch (this.plotType) {
            case "BAR":
                let barChartPoints: Point<number, string>[] = points.map(point => ({ x: Number(point.x), y: String(point.y) }))
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
                const lineChartPoints: Point<number, number>[] = points.map(point => ({ x: Number(point.x), y: Number(point.y) }));
                lineChartPoints.sort((p1, p2) => p1.x - p2.x);
                return lineChart(this._slicePoints(lineChartPoints), config);
            case "SCATTER":
                const scatterPlotPoints: Point<number, number>[] = points.map(point => ({ x: Number(point.x), y: Number(point.y) }));
                scatterPlotPoints.sort((p1, p2) => p1.x - p2.x);
                return scatterPlot(this._slicePoints(scatterPlotPoints), config);
            default:
                throw new PQLError(`Invalid plot type ${this.plotType}`);
        }
    }

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
        if (!isNaN(value)) {
            result += value;
        }
    }
    return result
}

function getLabel(attribute: UsingAttribute): string {
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
