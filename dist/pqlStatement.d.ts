import { LimitAndOffset, PlotConfig, RowData, PlotCall } from "./types";
import { WhereFilter } from "./filters";
export declare class PQLStatement {
    readonly plotCall: PlotCall;
    readonly whereFilter?: WhereFilter | undefined;
    readonly groupByColumn?: string | undefined;
    readonly limitAndOffset?: LimitAndOffset | undefined;
    constructor(plotCall: PlotCall, whereFilter?: WhereFilter | undefined, groupByColumn?: string | undefined, limitAndOffset?: LimitAndOffset | undefined);
    static create(query: string): PQLStatement;
    execute(data: RowData[], config: PlotConfig): SVGSVGElement;
    private _processData;
    private _computeAggregatedColumn;
    private _createBarChart;
    private _createXYPlot;
}
