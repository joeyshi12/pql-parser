import { PQLError } from "./exceptions";
import { LimitAndOffset, PlotConfig, Primitive, RowData, PlotColumn, PlotCall } from "./types";
import { barChart, lineChart, scatterPlot } from "./plots";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { WhereFilter } from "./filters";

/**
 * AST representation of a PQL query
 */
export class PQLStatement {
    constructor(public readonly plotCall: PlotCall,
                public readonly whereFilter?: WhereFilter,
                public readonly groupByColumn?: string,
                public readonly limitAndOffset?: LimitAndOffset) {
    }

    /**
     * Creates a PQLStatement from a PQL query string
     * @param query - Query string
     * @returns PQLStatement
     */
    public static create(query: string): PQLStatement {
        return new Parser(new Lexer(query)).parse();
    }

    /**
     * Creates an SVG plot element from given data and config
     * @param data   - Row data for plot
     * @param config - Plot display configs
     * @returns SVG plot element
     */
    public execute(data: RowData[], config: PlotConfig): SVGSVGElement {
        const filteredData = this.whereFilter ? data.filter(row => this.whereFilter?.satisfy(row)) : data;
        const columnDataMap = this._processData(filteredData);
        switch (this.plotCall.plotType) {
            case "BAR":
                return this._createBarChart(columnDataMap, config);
            case "LINE":
                return this._createXYPlot(columnDataMap, config);
            case "SCATTER":
                return this._createXYPlot(columnDataMap, config, true);
            default:
                throw new PQLError(`Invalid plot type ${this.plotCall}`);
        }
    }

    private _processData(data: RowData[]): Map<string, Primitive[]> {
        const columnDataMap: Map<string, Primitive[]> = new Map();

        if (!this.groupByColumn) {
            this.plotCall.args.forEach((plotColumn, name) => {
                columnDataMap.set(name, data.map(row => row[plotColumn.column!]));
            });
            return columnDataMap;
        }

        const groups: Map<Primitive, RowData[]> = new Map();
        for (let row of data) {
            const groupByValue = row[this.groupByColumn!];
            if (groups.has(groupByValue)) {
                groups.get(groupByValue)!.push(row);
            } else {
                groups.set(groupByValue, [row]);
            }
        }

        const groupEntries: [Primitive, RowData[]][] = Array.from(groups.entries());
        for (let [name, plotColumn] of this.plotCall.args) {
            columnDataMap.set(name, this._computeAggregatedColumn(groupEntries, plotColumn));
        }

        return columnDataMap;
    }

    private _computeAggregatedColumn(groupEntries: [Primitive, RowData[]][], plotColumn: PlotColumn) {
        switch (plotColumn.aggregationFunction) {
            case "MIN":
                return groupEntries.map(([_, rows]) => columnMin(rows, plotColumn.column!));
            case "MAX":
                return groupEntries.map(([_, rows]) => columnMax(rows, plotColumn.column!));
            case "AVG":
                return groupEntries.map(([_, rows]) => columnSum(rows, plotColumn.column!) / rows.length);
            case "SUM":
                return groupEntries.map(([_, rows]) => columnSum(rows, plotColumn.column!));
            case "COUNT":
                return groupEntries.map(([_, rows]) => rows.length);
            case undefined:
                if (plotColumn.column === this.groupByColumn) {
                    return groupEntries.map(([key, _]) => key);
                }
            default:
                throw new PQLError(`Invalid aggregation function type ${plotColumn.aggregationFunction}`);
        }
    }

    private _createBarChart(columnDataMap: Map<string, Primitive[]>, config: PlotConfig): SVGSVGElement {
        const categoryColumn = this.plotCall.args.get("categories");
        const valuesColumn = this.plotCall.args.get("values");
        if (!categoryColumn || !valuesColumn) {
            throw new PQLError("Missing category or values column");
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
            throw new PQLError("Missing category or values data");
        }

        let points: [string, number][] = categories.map((category, i): [string, number] => [String(category), Number(values[i])])
            .filter(([_, value]: [string, number]) => !isNaN(value));
        points.sort((p1, p2) => p2[1] - p1[1]);

        if (this.limitAndOffset) {
            points = points.slice(
                this.limitAndOffset.offset,
                this.limitAndOffset.offset + this.limitAndOffset.limit
            );
        }

        points.reverse();
        return barChart(points, config);
    }

    private _createXYPlot(columnDataMap: Map<string, Primitive[]>, config: PlotConfig, isScatter: boolean = false): SVGSVGElement {
        const xColumn = this.plotCall.args.get("x");
        const yColumn = this.plotCall.args.get("y");
        if (!xColumn || !yColumn) {
            throw new PQLError("Missing x or y column");
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
            throw new PQLError("Missing x or y data");
        }

        let points: [number, number][] = xData.map((x, i): [number, number] => [Number(x), Number(yData[i])])
            .filter(([x, y]: [number, number]) => !isNaN(x) && !isNaN(y));
        points.sort((p1, p2) => p1[0] - p2[0]);

        if (this.limitAndOffset) {
            points = points.slice(
                this.limitAndOffset.offset,
                this.limitAndOffset.offset + this.limitAndOffset.limit
            );
        }

        return isScatter ? scatterPlot(points, config) : lineChart(points, config);
    }
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
