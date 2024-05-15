import { LimitAndOffset, PlotConfig, RowData, PlotCall } from "./types";
import { WhereFilter } from "./filters";
/**
 * AST representation of a PQL query
 */
export declare class PQLStatement {
    readonly plotCall: PlotCall;
    readonly whereFilter?: WhereFilter | undefined;
    readonly groupByColumn?: string | undefined;
    readonly limitAndOffset?: LimitAndOffset | undefined;
    constructor(plotCall: PlotCall, whereFilter?: WhereFilter | undefined, groupByColumn?: string | undefined, limitAndOffset?: LimitAndOffset | undefined);
    /**
     * Creates a PQLStatement from a PQL query string
     * @param query - Query string
     * @returns PQLStatement
     */
    static create(query: string): PQLStatement;
    /**
     * Creates an SVG plot element from given data and config
     * @param data   - Row data for plot
     * @param config - Plot display configs
     * @returns SVG plot element
     */
    execute(data: RowData[], config: PlotConfig): SVGSVGElement;
    private _processData;
    private _computeAggregatedColumn;
    private _createBarChart;
    private _createXYPlot;
}
